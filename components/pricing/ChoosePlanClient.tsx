"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Star, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Package {
  id: string;
  name: string;
  tagline: string | null;
  price: string;
  durationDays: number;
  maxListings: number;
  heroSpotsPerMonth: number;
  featuredSlotsPerMonth: number;
  badge: string | null;
  badgeColor: string | null;
  features: string[];
  isFree: boolean;
  isPopular: boolean;
}

interface ChoosePlanClientProps {
  packages: Package[];
}

export function ChoosePlanClient({ packages }: ChoosePlanClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(pkg: Package) {
    setLoading(pkg.id);
    try {
      if (pkg.isFree) {
        // Activate free plan
        const res = await fetch("/api/payments/activate-free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId: pkg.id }),
        });
        const data = await res.json();
        if (data.success) {
          router.push("/dashboard?onboarding=true");
        }
      } else {
        // Initialize Paystack payment
        const res = await fetch("/api/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId: pkg.id }),
        });
        const data = await res.json();
        if (data.authorizationUrl) {
          // eslint-disable-next-line react-hooks/immutability
          window.location.href = data.authorizationUrl;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
            pkg.isPopular
              ? "border-[hsl(var(--color-primary))]"
              : "border-[hsl(var(--border))]"
          }`}
        >
          {pkg.isPopular && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--color-primary))] px-3 py-1 text-xs font-bold text-white shadow">
                <Star className="h-3 w-3 fill-current" /> Most Popular
              </span>
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-display text-lg font-bold">{pkg.name}</h3>
            {pkg.tagline && (
              <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">{pkg.tagline}</p>
            )}
          </div>

          <div className="mb-6">
            {pkg.isFree ? (
              <div className="font-display text-3xl font-extrabold text-[hsl(var(--color-secondary))]">
                Free
              </div>
            ) : (
              <div>
                <span className="font-display text-3xl font-extrabold">
                  {formatPrice(parseFloat(pkg.price))}
                </span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">/month</span>
              </div>
            )}
            {pkg.badge && (
              <span
                className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: pkg.badgeColor || "#6366f1" }}
              >
                <Zap className="h-3 w-3" />
                {pkg.badge}
              </span>
            )}
          </div>

          <ul className="mb-6 flex-1 space-y-2.5">
            {pkg.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--color-secondary))]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSelect(pkg)}
            disabled={!!loading}
            className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
              pkg.isPopular
                ? "bg-[hsl(var(--color-primary))] text-white hover:opacity-90 shadow-lg shadow-[hsl(var(--color-primary)/0.25)]"
                : pkg.isFree
                ? "bg-[hsl(var(--color-secondary))] text-white hover:opacity-90"
                : "border-2 border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary)/0.05)]"
            } disabled:opacity-50`}
          >
            {loading === pkg.id ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : pkg.isFree ? (
              "Start Free"
            ) : (
              "Get Started"
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
