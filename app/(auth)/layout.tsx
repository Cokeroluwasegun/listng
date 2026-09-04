import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[color-mix(in_srgb,var(--muted),transparent 30%)]">
      {children}
    </div>
  );
}
