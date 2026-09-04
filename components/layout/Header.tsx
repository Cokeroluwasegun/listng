"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Bell,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Settings,
  Heart,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { cn, getInitials } from "@/lib/utils";

const CATEGORIES_NAV = [
  { label: "Electronics", href: "/categories/electronics" },
  { label: "Vehicles", href: "/categories/vehicles" },
  { label: "Real Estate", href: "/categories/real-estate" },
  { label: "Fashion", href: "/categories/fashion" },
  { label: "Agriculture", href: "/categories/agriculture" },
  { label: "Services", href: "/categories/services" },
  { label: "Jobs", href: "/categories/jobs" },
];

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const user = session?.user;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-white transition-shadow duration-200",
        scrolled && "shadow-md"
      )}
    >
      {/* ─── Top Bar ─── */}
      <div className="section">
        <div className="flex h-16 items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
              <span className="text-lg font-black text-white">L</span>
            </div>
            <span className="hidden font-display text-xl font-bold text-[hsl(var(--foreground))] sm:block">
              List<span className="text-[hsl(var(--color-primary))]">NG</span>
            </span>
          </Link>

          {/* Location pill */}
          <Link
            href="/markets"
            className="hidden items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))] lg:flex"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Browse Markets</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-1 items-center gap-0">
            <div className="relative flex flex-1 items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings, markets, vendors..."
                className="h-10 w-full rounded-l-lg border border-[hsl(var(--input))] bg-white pl-10 pr-3 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
              />
            </div>
            <button
              type="submit"
              className="h-10 rounded-r-lg bg-[hsl(var(--color-primary))] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Search
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/dashboard/messages"
                  className="relative hidden h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] sm:flex"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="relative hidden h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] sm:flex"
                >
                  <Bell className="h-5 w-5" />
                </Link>

                {/* Sell Button */}
                <Link
                  href="/listings/create"
                  className="hidden items-center gap-1.5 rounded-lg bg-[hsl(var(--color-primary))] px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:flex"
                >
                  <PlusCircle className="h-4 w-4" />
                  Sell
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-1 pr-2.5 transition-colors hover:border-[hsl(var(--color-primary)/0.4)]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-xs font-bold text-white">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        getInitials(user.name || "U")
                      )}
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-2 w-56 animate-scale-in rounded-xl border border-[hsl(var(--border))] bg-white p-1.5 shadow-xl">
                        <div className="border-b border-[hsl(var(--border))] px-3 py-2 pb-3">
                          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{user.name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          <UserMenuItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setUserMenuOpen(false)} />
                          <UserMenuItem href="/profile/me" icon={User} label="My Profile" onClick={() => setUserMenuOpen(false)} />
                          <UserMenuItem href="/dashboard/saved" icon={Heart} label="Saved Items" onClick={() => setUserMenuOpen(false)} />
                          {user.role === "ADMIN" && (
                            <UserMenuItem href="/admin" icon={ShieldCheck} label="Admin Panel" onClick={() => setUserMenuOpen(false)} />
                          )}
                          <UserMenuItem href="/dashboard/settings" icon={Settings} label="Settings" onClick={() => setUserMenuOpen(false)} />
                        </div>
                        <div className="mt-1 border-t border-[hsl(var(--border))] pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3.5 py-2 text-sm font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] sm:block"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[hsl(var(--color-primary))] px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Category Nav Bar ─── */}
      <div className="hidden border-t border-[hsl(var(--border))] md:block">
        <div className="section">
          <nav className="flex items-center gap-0 overflow-x-auto py-0 scrollbar-none">
            <Link
              href="/markets"
              className="flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-[hsl(var(--color-primary))] transition-colors hover:bg-[hsl(var(--color-primary)/0.05)]"
            >
              <MapPin className="h-4 w-4" />
              Markets
            </Link>
            <div className="h-4 w-px bg-[hsl(var(--border))]" />
            {CATEGORIES_NAV.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="shrink-0 px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href="/categories"
              className="ml-auto flex shrink-0 items-center gap-1 px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              All Categories
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </div>

      {/* ─── Mobile Menu ─── */}
      {mobileMenuOpen && (
        <div className="animate-slide-up border-t border-[hsl(var(--border))] bg-white md:hidden">
          <div className="section py-4">
            <div className="space-y-1">
              <Link href="/markets" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-[hsl(var(--color-primary))]" onClick={() => setMobileMenuOpen(false)}>
                <MapPin className="h-4 w-4" /> Browse Markets
              </Link>
              {CATEGORIES_NAV.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
              {!user && (
                <div className="mt-4 flex gap-2 border-t border-[hsl(var(--border))] pt-4">
                  <Link href="/login" className="flex-1 rounded-lg border border-[hsl(var(--border))] py-2.5 text-center text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                  <Link href="/register" className="flex-1 rounded-lg bg-[hsl(var(--color-primary))] py-2.5 text-center text-sm font-semibold text-white" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
                </div>
              )}
              {user && (
                <Link href="/listings/create" className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--color-primary))] py-2.5 text-sm font-semibold text-white" onClick={() => setMobileMenuOpen(false)}>
                  <PlusCircle className="h-4 w-4" /> Sell an Item
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function UserMenuItem({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
    >
      <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
      {label}
    </Link>
  );
}
