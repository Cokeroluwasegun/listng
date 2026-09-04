import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addDays } from "date-fns";
import { rateLimit } from "@/lib/rate-limit";

// Activate free plan without payment
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(`payments:free:${session.user.id}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { packageId } = await request.json();

  const pkg = await db.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isFree) {
    return NextResponse.json({ error: "Not a free package" }, { status: 400 });
  }

  // Check if user already has an active paid subscription
  const existing = await db.userSubscription.findUnique({
    where: { userId: session.user.id },
    include: { package: { select: { isFree: true } } },
  });

  if (existing && !existing.package.isFree) {
    return NextResponse.json({ error: "Already on a paid plan" }, { status: 400 });
  }

  const endDate = addDays(new Date(), pkg.durationDays);

  await db.userSubscription.upsert({
    where: { userId: session.user.id },
    update: {
      packageId,
      status: "ACTIVE",
      startDate: new Date(),
      endDate,
      listingsUsed: 0,
    },
    create: {
      userId: session.user.id,
      packageId,
      status: "ACTIVE",
      startDate: new Date(),
      endDate,
    },
  });

  return NextResponse.json({ success: true });
}
