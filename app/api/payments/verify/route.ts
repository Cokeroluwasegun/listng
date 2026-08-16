import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activateSubscriptionForPayment, getPaystackSecret } from "@/lib/payments";
import { logger } from "@/lib/logger";

// Client-side return callback after Paystack checkout. This route must NOT be
// the source of truth for payments — the signed webhook is. It simply looks up
// the user's own payment, re-verifies it with Paystack, and redirects back to
// the app. If the webhook already activated the subscription, this is a no-op.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(new URL("/login?callbackUrl=/dashboard", request.url));
  }

  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.redirect(new URL("/choose-plan?payment=error", request.url));
  }

  const payment = await db.payment.findUnique({ where: { reference: ref } });

  // The payment must belong to the requesting user — never trust metadata
  // from the Paystack response to decide who gets the subscription.
  if (!payment || payment.userId !== session.user.id) {
    return NextResponse.redirect(new URL("/choose-plan?payment=error", request.url));
  }

  const secret = getPaystackSecret();
  if (!secret) {
    return NextResponse.redirect(new URL("/choose-plan?payment=error", request.url));
  }

  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await paystackRes.json();

    if (!data.status || data.data.status !== "success") {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.redirect(new URL("/choose-plan?payment=failed", request.url));
    }

    // Cross-check the charge amount and currency before activating.
    const paidKobo = data.data.amount;
    const expectedKobo = Math.round(Number(payment.amount) * 100);
    if (data.data.currency !== "NGN" || paidKobo !== expectedKobo) {
      return NextResponse.redirect(new URL("/choose-plan?payment=error", request.url));
    }

    await activateSubscriptionForPayment(payment);
  } catch (error) {
    logger.error("Verification failed", { err: String(error) });
    return NextResponse.redirect(new URL("/choose-plan?payment=error", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard?payment=success", request.url));
}