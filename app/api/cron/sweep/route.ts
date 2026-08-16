import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkSecret(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.nextUrl.searchParams.get("secret");
  return provided === expected;
}

async function expireSubscriptions() {
  const now = new Date();
  const result = await db.userSubscription.updateMany({
    where: { status: "ACTIVE", endDate: { lt: now } },
    data: { status: "EXPIRED" },
  });
  return result.count;
}

async function expireListings() {
  const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const result = await db.listing.updateMany({
    where: { status: "ACTIVE", createdAt: { lt: cutoff } },
    data: { status: "EXPIRED" },
  });
  return result.count;
}

export async function GET(request: NextRequest) {
  if (!checkSecret(request)) return unauthorized();
  const subCount = await expireSubscriptions();
  const listingCount = await expireListings();
  logger.info("Cron sweep completed", { expiredSubs: subCount, expiredListings: listingCount });
  return NextResponse.json({ ok: true, expiredSubs: subCount, expiredListings: listingCount });
}

export const POST = GET;
