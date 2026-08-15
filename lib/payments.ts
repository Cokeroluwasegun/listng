import { createHmac, timingSafeEqual } from "crypto";
import { addDays } from "date-fns";
import { db } from "@/lib/db";

export function getPaystackSecret(): string | null {
  return process.env.PAYSTACK_SECRET_KEY || null;
}

// Verifies the Paystack `x-paystack-signature` header (HMAC-SHA512 of the raw
// request body using the secret key). Constant-time comparison prevents timing
// attacks.
export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secret = getPaystackSecret();
  if (!secret || !signature) return false;
  try {
    const expected = createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

interface ActivateResult {
  packageName: string;
  endDate: Date;
}

// Activates a subscription from a verified payment record. Cross-checks that
// the amount paid matches the package price before granting access. Idempotent
// for payments already marked SUCCESS.
export async function activateSubscriptionForPayment(
  payment: {
    id: string;
    userId: string;
    reference: string;
    amount: { toNumber(): number } | number;
    status: string;
    metadata: unknown;
  }
): Promise<ActivateResult> {
  if (payment.status === "SUCCESS") {
    const existing = await db.userSubscription.findUnique({
      where: { userId: payment.userId },
    });
    const pkgName = existing ? await db.package.findUnique({ where: { id: existing.packageId } }) : null;
    return { packageName: pkgName?.name ?? "Subscription", endDate: existing?.endDate ?? new Date() };
  }

  const metadata = (payment.metadata ?? {}) as { packageId?: string };
  if (!metadata.packageId) {
    throw new Error("Payment metadata is missing packageId");
  }

  const pkg = await db.package.findUnique({ where: { id: metadata.packageId } });
  if (!pkg || !pkg.isActive) {
    throw new Error("Package not found or inactive");
  }

  // Amount cross-check: Paystack charges in kobo (amount * 100).
  const paidKobo = Math.round(Number(payment.amount) * 100);
  const expectedKobo = Math.round(Number(pkg.price) * 100);
  if (paidKobo !== expectedKobo) {
    throw new Error(
      `Payment amount mismatch for ${payment.reference}: expected ${expectedKobo}, received ${paidKobo}`
    );
  }

  const endDate = addDays(new Date(), pkg.durationDays);

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS" },
    });

    await tx.userSubscription.upsert({
      where: { userId: payment.userId },
      update: {
        packageId: pkg.id,
        status: "ACTIVE",
        startDate: new Date(),
        endDate,
        listingsUsed: 0,
        heroSpotsUsed: 0,
        paymentRef: payment.reference,
      },
      create: {
        userId: payment.userId,
        packageId: pkg.id,
        status: "ACTIVE",
        startDate: new Date(),
        endDate,
        paymentRef: payment.reference,
      },
    });

    await tx.notification.create({
      data: {
        userId: payment.userId,
        type: "GENERAL",
        title: `${pkg.name} activated!`,
        message: `Your ${pkg.name} subscription is now active until ${endDate.toLocaleDateString("en-NG")}.`,
      },
    });
  });

  return { packageName: pkg.name, endDate };
}