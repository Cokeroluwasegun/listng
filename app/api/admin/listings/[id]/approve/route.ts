import { NextRequest, NextResponse } from "next/server";
import { guardRequest, handleApiError } from "@/lib/api-guard";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRequest(request, { routeContext: "admin", csrf: true });
  if (!guard.ok) return guard.response;
  const { requestId } = guard.data;
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    // In a real app we'd wrap this in a transaction
    // 1. Update listing status
    const listing = await db.listing.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    });

    // 2. Create notification for seller
    await db.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'LISTING_APPROVED',
        title: 'Listing Approved',
        message: `Your listing "${listing.title}" has been approved and is now active.`,
        data: { link: `/listings/${listing.id}` },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(requestId, err);
  }
}