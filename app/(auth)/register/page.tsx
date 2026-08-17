"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Store, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"individual" | "vendor" | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--muted)/0.4)] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--color-primary))]">
              <span className="text-xl font-black text-white">L</span>
            </div>
            <span className="font-display text-2xl font-bold">
              List<span className="text-[hsl(var(--color-primary))]">NG</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-[hsl(var(--foreground))]">
            Create your account
          </h1>
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">
            Choose how you want to use ListNG
          </p>
        </div>

        {/* Account Type Cards */}
        <div className="space-y-4">
          <AccountTypeCard
            type="individual"
            selected={selected === "individual"}
            onSelect={() => setSelected("individual")}
            icon={User}
            title="Individual Seller"
            description="Sell personal items, second-hand goods, or freelance services"
            features={[
              "Up to 5 free listings",
              "Direct buyer messaging",
              "Face verification for trust",
              "Access to all markets",
            ]}
            badge="Free to start"
            badgeColor="green"
          />
          <AccountTypeCard
            type="vendor"
            selected={selected === "vendor"}
            onSelect={() => setSelected("vendor")}
            icon={Store}
            title="Business / Vendor"
            description="Register your business with CAC verification and unlock a full vendor store"
            features={[
              "Business profile with store page",
              "CAC registration verification",
              "Verified Merchant badge",
              "Analytics & hero spot booking",
            ]}
            badge="CAC Verified"
            badgeColor="amber"
          />
        </div>

        {/* Continue Button */}
        <button
          disabled={!selected}
          onClick={() => selected && router.push(`/register/${selected}`)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--color-primary))] py-3.5 font-semibold text-white shadow-lg shadow-[hsl(var(--color-primary)/0.25)] transition-all hover:opacity-90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[hsl(var(--color-primary))] hover:underline">
            Log in
          </Link>
        </p>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 border-t border-[hsl(var(--border))] pt-6">
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            Face-verified accounts
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            CAC business verification
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountTypeCard({
  type, selected, onSelect, icon: Icon, title, description, features, badge, badgeColor,
}: {
  type: string; selected: boolean; onSelect: () => void;
  icon: React.ElementType; title: string; description: string;
  features: string[]; badge: string; badgeColor: "green" | "amber";
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border-2 p-5 text-left transition-all duration-200 ${
        selected
          ? "border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.04)] shadow-md"
          : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--color-primary)/0.4)] hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          selected ? "bg-[hsl(var(--color-primary))]" : "bg-[hsl(var(--muted))]"
        } transition-colors`}>
          <Icon className={`h-6 w-6 ${selected ? "text-white" : "text-[hsl(var(--muted-foreground))]"}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-[hsl(var(--foreground))]">{title}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              badgeColor === "green" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            }`}>{badge}</span>
          </div>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
          <ul className="mt-3 space-y-1.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))]">
                <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${selected ? "text-[hsl(var(--color-primary))]" : "text-green-500"}`} />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))]" : "border-[hsl(var(--border))]"
        }`}>
          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}
