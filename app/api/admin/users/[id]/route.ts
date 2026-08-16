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
    const action = body.action as "suspend" | "unsuspend";
    if (!["suspend", "unsuspend"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id },
      data:
        action === "suspend"
          ? { isSuspended: true, suspendedAt: new Date(), suspendReason: body.reason || null }
          : { isSuspended: false, suspendedAt: null, suspendReason: null },
      select: { id: true, isSuspended: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return handleApiError(requestId, err);
  }
}