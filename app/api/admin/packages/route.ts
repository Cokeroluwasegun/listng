import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { guardRequest, handleApiError } from "@/lib/api-guard";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

const packageSchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  tagline: z.string().max(120).optional().or(z.literal("")),
  price: z.coerce.number().min(0),
  durationDays: z.coerce.number().int().positive(),
  maxListings: z.coerce.number().int().min(-1),
  boostFrequencyHours: z.coerce.number().int().positive().default(168),
  heroSpotsPerMonth: z.coerce.number().int().min(0).default(0),
  featuredSlotsPerMonth: z.coerce.number().int().min(-1).default(0),
  badge: z.string().max(40).optional().or(z.literal("")),
  badgeColor: z.string().max(20).optional().or(z.literal("")),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFree: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export async function POST(request: NextRequest) {
  const guard = await guardRequest(request, { routeContext: "admin", csrf: true });
  if (!guard.ok) return guard.response;
  const { requestId } = guard.data;
  try {
    const parsed = packageSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const slug = data.slug || slugify(data.name);
    const existing = await db.package.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A package with this slug already exists" }, { status: 409 });
    }

    const pkg = await db.package.create({
      data: {
        name: data.name,
        slug,
        tagline: data.tagline || null,
        price: new Prisma.Decimal(data.price),
        durationDays: data.durationDays,
        maxListings: data.maxListings,
        boostFrequencyHours: data.boostFrequencyHours,
        heroSpotsPerMonth: data.heroSpotsPerMonth,
        featuredSlotsPerMonth: data.featuredSlotsPerMonth,
        badge: data.badge || null,
        badgeColor: data.badgeColor || null,
        features: data.features,
        isActive: data.isActive,
        isFree: data.isFree,
        isPopular: data.isPopular,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({ success: true, pkg }, { status: 201 });
  } catch (err) {
    return handleApiError(requestId, err);
  }
}