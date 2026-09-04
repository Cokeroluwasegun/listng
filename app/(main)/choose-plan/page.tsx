import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChoosePlanClient } from "@/components/pricing/ChoosePlanClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Your Plan — ListNG",
  description: "Select a seller package to start listing on Nigeria's premier marketplace.",
};

export default async function ChoosePlanPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/register");

  // Check if user already has an active subscription
  const existingSub = await db.userSubscription.findUnique({
    where: { userId: session.user.id },
    include: { package: true },
  });

  const packages = await db.package.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-[color-mix(in_srgb,var(--muted),transparent 30%)] py-16">
      <div className="section">
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-extrabold text-[var(--foreground)]">
            Choose Your Seller Plan
          </h1>
          <p className="mt-3 text-lg text-[var(--muted-foreground)]">
            Start free, scale as you grow. All plans include access to all Nigerian markets.
          </p>
          {existingSub && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              You&apos;re currently on the <strong>{existingSub.package.name}</strong> plan.
              Upgrading will replace it immediately.
            </div>
          )}
        </div>

        <ChoosePlanClient packages={packages.map(p => ({
          ...p,
          price: p.price.toString(),
        }))} />

        <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
          Payments powered by <strong>Paystack</strong> · Secure card, bank transfer & USSD
        </p>
      </div>
    </div>
  );
}
