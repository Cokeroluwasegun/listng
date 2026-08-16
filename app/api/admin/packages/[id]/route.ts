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

    const inUse = await db.userSubscription.count({ where: { packageId: id } });
    if (inUse > 0) {
      return NextResponse.json(
        { error: "Cannot delete a package that has active subscribers" },
        { status: 409 }
      );
    }

    await db.package.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(requestId, err);
  }
}