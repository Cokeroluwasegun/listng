import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateReference } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

// Initialize Paystack transaction
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(`payments:init:${session.user.id}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many payment attempts. Try again later." }, { status: 429 });
  }

  const { packageId } = await request.json();
  if (!packageId) return NextResponse.json({ error: "packageId required" }, { status: 400 });

  // Fetch package
  const pkg = await db.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) return NextResponse.json({ error: "Package not found" }, { status: 404 });
  if (pkg.isFree) return NextResponse.json({ error: "Use activate-free endpoint for free plan" }, { status: 400 });

  const reference = generateReference("SUB");
  const amountKobo = Number(pkg.price) * 100; // Paystack uses kobo

  // Create pending payment record
  const payment = await db.payment.create({
    data: {
      userId: session.user.id,
      type: "SUBSCRIPTION",
      amount: pkg.price,
      reference,
      status: "PENDING",
      metadata: { packageId, packageName: pkg.name },
    },
  });

  // Initialize Paystack transaction
  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: session.user.email,
      amount: amountKobo,
      reference,
      currency: "NGN",
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify?ref=${reference}`,
      metadata: {
        userId: session.user.id,
        packageId,
        packageName: pkg.name,
        paymentId: payment.id,
      },
    }),
  });

  const paystackData = await paystackRes.json();

  if (!paystackData.status) {
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }

  return NextResponse.json({
    authorizationUrl: paystackData.data.authorization_url,
    reference,
    accessCode: paystackData.data.access_code,
  });
}
