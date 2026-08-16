import { NextRequest, NextResponse } from "next/server";
import { guardRequest, handleApiError } from "@/lib/api-guard";
import { db } from "@/lib/db";

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
    const action = body.action as "approve" | "reject";
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const spot = await db.marketHeroSpot.update({
      where: { id },
      data:
        action === "approve"
          ? { isApproved: true, approvedAt: new Date(), rejectedAt: null, rejectReason: null }
          : { isApproved: false, approvedAt: null, rejectedAt: new Date(), rejectReason: body.reason || null },
      include: { user: { select: { id: true } } },
    });

    await db.notification.create({
      data: {
        userId: spot.user.id,
        type: action === "approve" ? "HERO_SPOT_APPROVED" : "HERO_SPOT_REJECTED",
        title: action === "approve" ? "Hero spot approved" : "Hero spot rejected",
        message:
          action === "approve"
            ? `Your hero spot "${spot.title}" is now live.`
            : `Your hero spot "${spot.title}" was rejected.`,
        data: { link: "/dashboard" },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(requestId, err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRequest(request, { routeContext: "admin", csrf: true });
  if (!guard.ok) return guard.response;
  const { requestId } = guard.data;
  try {
    const { id } = await params;
    await db.marketHeroSpot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(requestId, err);
  }
}