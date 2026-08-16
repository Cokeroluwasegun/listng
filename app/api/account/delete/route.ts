import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const body = await request.json().catch(() => ({}));
  const confirmation = body?.confirm;
  if (confirmation !== "DELETE MY ACCOUNT") {
    return NextResponse.json(
      { error: "Confirmation required. Send { confirm: 'DELETE MY ACCOUNT' }" },
      { status: 400 }
    );
  }

  await db.$transaction(async (tx) => {
    await tx.message.deleteMany({ where: { senderId: userId } });
    await tx.conversationParticipant.deleteMany({ where: { userId } });
    await tx.conversation.deleteMany({ where: { participants: { none: {} } } });
    await tx.notification.deleteMany({ where: { userId } });
    await tx.savedListing.deleteMany({ where: { userId } });
    await tx.review.deleteMany({ where: { OR: [{ reviewerId: userId }, { revieweeId: userId }] } });
    await tx.report.deleteMany({ where: { reporterId: userId } });
    await tx.loginHistory.deleteMany({ where: { userId } });
    await tx.userDevice.deleteMany({ where: { userId } });
    await tx.cACVerification.deleteMany({ where: { vendorProfile: { userId } } });
    await tx.vendorProfile.deleteMany({ where: { userId } });
    await tx.marketHeroSpot.deleteMany({ where: { userId } });
    await tx.userSubscription.deleteMany({ where: { userId } });
    await tx.payment.deleteMany({ where: { userId } });
    await tx.listing.deleteMany({ where: { sellerId: userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  logger.info("User account deleted (NDPR right to be forgotten)", { userId });

  return NextResponse.json({ success: true });
}
