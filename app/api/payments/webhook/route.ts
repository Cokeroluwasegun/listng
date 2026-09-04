import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  activateSubscriptionForPayment,
  verifyPaystackSignature,
  checkAndMarkWebhookEvent,
  markWebhookEventProcessed,
  markWebhookEventFailed,
} from "@/lib/payments";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PaystackPayload {
  id?: number | string;
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
  };
}

function deriveEventId(payload: PaystackPayload): string | null {
  if (payload.id !== undefined && payload.id !== null) {
    return String(payload.id);
  }
  const ref = payload.data?.reference;
  const event = payload.event;
  if (ref && event) {
    return `${event}-${ref}-${Date.now()}`;
  }
  return null;
}

// Paystack webhook — the server-side source of truth for payment success.
// The client callback (/api/payments/verify) is only a UX redirect; it must
// never be trusted for activating subscriptions.
//
// Idempotency: every event is keyed by its Paystack event id (or a fallback
// from event+reference). If we've already processed it we short-circuit
// with 200 so Paystack stops retrying.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    logger.warn("Paystack webhook signature failed", { hasSignature: Boolean(signature) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: PaystackPayload;
  try {
    payload = JSON.parse(rawBody) as PaystackPayload;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const eventType = payload.event ?? "unknown";
  const eventId = deriveEventId(payload);
  if (!eventId) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  const idempotency = await checkAndMarkWebhookEvent(eventId, eventType, payload);

  if (!idempotency.isNew) {
    logger.info("Duplicate webhook event ignored", {
      eventId,
      eventType,
      previousStatus: idempotency.existingEvent?.status,
    });
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (eventType !== "charge.success") {
    await markWebhookEventProcessed(eventId);
    return NextResponse.json({ received: true });
  }

  const reference = payload.data?.reference;
  if (!reference) {
    await markWebhookEventFailed(eventId, "missing_reference");
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { reference } });
  if (!payment) {
    logger.error("No payment record for reference", { reference, eventId });
    await markWebhookEventFailed(eventId, "payment_not_found");
    return NextResponse.json({ received: true });
  }

  try {
    await activateSubscriptionForPayment(payment);
    await markWebhookEventProcessed(eventId);
    logger.info("Subscription activated via webhook", { reference, eventId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Subscription activation failed", { reference, eventId, err: message });
    await markWebhookEventFailed(eventId, message);
    return NextResponse.json({ error: "Activation failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
