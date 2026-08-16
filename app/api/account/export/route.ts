import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [user, vendorProfile, cacVerifications, listings, conversations, messages, payments, subscriptions, savedListings, notifications, reviews, reports, devices, logins] =
    await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.vendorProfile.findUnique({ where: { userId } }),
      db.cACVerification.findMany({ where: { vendorProfile: { userId } } }),
      db.listing.findMany({ where: { sellerId: userId } }),
      db.conversation.findMany({ where: { participants: { some: { userId } } }, include: { participants: true, messages: true } }),
      db.message.findMany({ where: { senderId: userId } }),
      db.payment.findMany({ where: { userId } }),
      db.userSubscription.findMany({ where: { userId } }),
      db.savedListing.findMany({ where: { userId } }),
      db.notification.findMany({ where: { userId } }),
      db.review.findMany({ where: { OR: [{ reviewerId: userId }, { revieweeId: userId }] } }),
      db.report.findMany({ where: { reporterId: userId } }),
      db.userDevice.findMany({ where: { userId } }),
      db.loginHistory.findMany({ where: { userId } }),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: user ? { ...user, password: undefined, faceDescriptor: undefined } : null,
    vendorProfile,
    cacVerifications,
    listings,
    conversations,
    messages,
    payments,
    subscriptions,
    savedListings,
    notifications,
    reviews,
    reports,
    devices,
    logins,
  };

  logger.info("User data export requested", { userId });

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="listng-data-${userId}.json"`,
    },
  });
}
