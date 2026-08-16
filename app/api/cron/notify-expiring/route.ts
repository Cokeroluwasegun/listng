import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkSecret(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.nextUrl.searchParams.get("secret");
  return provided === expected;
}

export async function GET(request: NextRequest) {
  if (!checkSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const expiring = await db.userSubscription.findMany({
    where: { status: "ACTIVE", endDate: { lte: inThreeDays, gt: new Date() } },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  for (const sub of expiring) {
    await db.notification.create({
      data: {
        userId: sub.user.id,
        type: "GENERAL",
        title: "Subscription expiring soon",
        message: `Your subscription expires on ${sub.endDate.toLocaleDateString("en-NG")}. Renew to keep your listings active.`,
      },
    });
  }
  logger.info("Subscription expiry reminders sent", { count: expiring.length });
  return NextResponse.json({ ok: true, remindersSent: expiring.length });
}
