import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { guardRequest, handleApiError } from "@/lib/api-guard";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRequest(request, { routeContext: "admin", csrf: true });
  if (!guard.ok) return guard.response;
  const { requestId } = guard.data;
  try {
    const { id } = await params;

    // Delete related records in FK-safe order (listings have no cascade from
    // conversations, and saved/review/report rows reference the listing).
    await db.$transaction(async (tx) => {
      await tx.message.deleteMany({
        where: { conversation: { listingId: id } },
      });
      await tx.conversationParticipant.deleteMany({
        where: { conversation: { listingId: id } },
      });
      await tx.conversation.deleteMany({ where: { listingId: id } });
      await tx.savedListing.deleteMany({ where: { listingId: id } });
      await tx.review.deleteMany({ where: { listingId: id } });
      await tx.report.deleteMany({ where: { listingId: id } });
      await tx.listing.delete({ where: { id } });
    }, { timeout: 15000 });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    return handleApiError(requestId, err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRequest(request, { routeContext: "admin", csrf: true });
  if (!guard.ok) return guard.response;
  const { requestId } = guard.data;
  try {
    const { id } = await params;

    const body = await request.json();
    const listing = await db.listing.update({
      where: { id },
      data: { isFeatured: body.featured === true },
      select: { id: true, isFeatured: true },
    });

    return NextResponse.json({ success: true, listing });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    return handleApiError(requestId, err);
  }
}