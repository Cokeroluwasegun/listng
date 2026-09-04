"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/listings/create", icon: PlusCircle, label: "Sell", isPrimary: true },
  { href: "/messages", icon: MessageSquare, label: "Chat" },
  { href: "/dashboard", icon: User, label: "Profile" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const href =
            !session && (item.href === "/listings/create" || item.href === "/dashboard" || item.href === "/messages")
              ? `/login?callbackUrl=${item.href}`
              : item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={href}
                className="flex flex-1 flex-col items-center pb-safe"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-lg shadow-[color-mix(in_srgb,var(--color-primary),transparent 35%)] -translate-y-3">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-[var(--muted-foreground)]">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors",
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-bottom bg-white" />
    </nav>
  );
}
