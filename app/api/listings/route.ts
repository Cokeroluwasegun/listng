import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { moderateText, logModeration } from "@/lib/moderation";
import { validateImageUrls } from "@/lib/image-validation";
import { logger, newRequestId } from "@/lib/logger";
import { getOrAssignRequestId } from "@/lib/request-id";

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  price: z.coerce.number().positive("Price must be greater than 0"),
  isNegotiable: z.boolean().default(false),
  condition: z
    .enum(["NEW", "USED", "REFURBISHED", "New", "Used", "Refurbished"])
    .transform((v) => v.toUpperCase() as "NEW" | "USED" | "REFURBISHED"),
  images: z.array(z.string().url("Image URLs must be valid")).min(1, "Add at least one image").max(10),
  categoryId: z.string().min(1),
  marketId: z.string().min(1).optional(),
  isUrgent: z.boolean().default(false),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const requestId = getOrAssignRequestId(req);
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = listingSchema.parse(body);
    const { marketId: requestedMarket, ...rest } = validated;

    // Content moderation: strip blocked link shorteners, redact profanity.
    const titleMod = moderateText(validated.title);
    const descMod = moderateText(validated.description);
    logModeration(session.user.id, "POST /api/listings", titleMod);
    logModeration(session.user.id, "POST /api/listings", descMod);

    // Image safety: HEAD-fetch each URL to confirm content-type & size.
    const { valid, invalid } = await validateImageUrls(validated.images);
    if (valid.length === 0) {
      return NextResponse.json(
        { error: "All images failed validation", invalid },
        { status: 400 }
      );
    }

    // The category must exist and be currently active.
    const category = await db.category.findUnique({ where: { id: validated.categoryId } });
    if (!category || !category.isActive) {
      return NextResponse.json({ error: "Selected category is invalid" }, { status: 400 });
    }

    // Fall back to the user's registered market if none was chosen.
    const marketId = requestedMarket ?? session.user.marketId ?? undefined;
    if (!marketId) {
      return NextResponse.json(
        { error: "A market is required. Select a market below or add one to your profile." },
        { status: 400 }
      );
    }
    const market = await db.market.findUnique({ where: { id: marketId } });
    if (!market) {
      return NextResponse.json({ error: "Selected market is invalid" }, { status: 400 });
    }

    // Enforce subscription & listing-slot limits.
    const subscription = await db.userSubscription.findUnique({
      where: { userId: session.user.id },
      include: { package: true },
    });

    if (!subscription || subscription.status !== "ACTIVE" || subscription.endDate < new Date()) {
      return NextResponse.json(
        { error: "No active subscription. Please subscribe to a plan to list items." },
        { status: 403 }
      );
    }

    const maxListings = subscription.package.maxListings;
    if (maxListings !== -1 && subscription.listingsUsed >= maxListings) {
      return NextResponse.json(
        { error: "Listing limit reached. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Create the listing and increment usage atomically.
    const listing = await db.$transaction(async (tx) => {
      const created = await tx.listing.create({
        data: {
          title: titleMod.sanitized,
          description: descMod.sanitized,
          price: new Prisma.Decimal(rest.price),
          isNegotiable: rest.isNegotiable,
          condition: rest.condition,
          images: valid,
          isUrgent: rest.isUrgent,
          attributes: rest.attributes as Prisma.InputJsonValue | undefined,
          categoryId: rest.categoryId,
          marketId,
          sellerId: session.user.id,
          status: "PENDING",
        },
      });
      await tx.userSubscription.update({
        where: { id: subscription.id },
        data: { listingsUsed: { increment: 1 } },
      });
      return created;
    });

    logger.info("Listing created", { requestId, listingId: listing.id, userId: session.user.id });
    return NextResponse.json({ success: true, listingId: listing.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 }
      );
    }
    logger.error("Listing creation error", { requestId, err: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const take = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const categoryId = searchParams.get("categoryId");
    const marketId = searchParams.get("marketId");
    const q = searchParams.get("q");

    const where: Prisma.ListingWhereInput = { status: "ACTIVE" };
    if (categoryId) where.categoryId = categoryId;
    if (marketId) where.marketId = marketId;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take,
        include: {
          seller: { select: { id: true, name: true, image: true, isFaceVerified: true } },
          market: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
      db.listing.count({ where }),
    ]);

    const listings = rows.map((l) => ({ ...l, price: l.price.toNumber() }));

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit: take,
        totalItems: total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error("Listings fetch error", { err: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}