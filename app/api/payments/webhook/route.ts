import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activateSubscriptionForPayment, verifyPaystackSignature } from "@/lib/payments";
import { logger } from "@/lib/logger";

// Paystack webhook — the server-side source of truth for payment success.
// The client callback (/api/payments/verify) is only a UX redirect; it must
// never be trusted for activating subscriptions.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    event?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      currency?: string;
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Only interested in successful charge events.
  if (payload.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = payload.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { reference } });
  if (!payment) {
    logger.error("No payment record for reference", { reference });
    return NextResponse.json({ received: true });
  }

  try {
    await activateSubscriptionForPayment(payment);
  } catch (error) {
    logger.error("Activation failed", { err: String(error) });
    // Non-2xx triggers Paystack retries; an unprocessable payment should not
    // be silently retried forever, but a transient failure should be.
    return NextResponse.json({ error: "Activation failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}