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

    const [children, listings] = await Promise.all([
      db.category.count({ where: { parentId: id } }),
      db.listing.count({ where: { categoryId: id } }),
    ]);

    if (children > 0 || listings > 0) {
      return NextResponse.json(
        { error: "Cannot delete a category that has sub-categories or listings" },
        { status: 409 }
      );
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(requestId, err);
  }
}