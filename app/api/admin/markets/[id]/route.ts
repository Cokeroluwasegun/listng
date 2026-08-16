import { NextRequest, NextResponse } from "next/server";
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

    const [users, listings, heroSpots] = await Promise.all([
      db.user.count({ where: { marketId: id } }),
      db.listing.count({ where: { marketId: id } }),
      db.marketHeroSpot.count({ where: { marketId: id } }),
    ]);

    if (users > 0 || listings > 0 || heroSpots > 0) {
      return NextResponse.json(
        { error: "Cannot delete a market that has sellers, listings or hero spots" },
        { status: 409 }
      );
    }

    await db.market.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(requestId, err);
  }
}