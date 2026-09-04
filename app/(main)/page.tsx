import Link from "next/link";
import { db } from "@/lib/db";
import HeroSearch from "@/components/home/HeroSearch";
import CategoryGrid from "@/components/home/CategoryGrid";
import MarketPicker from "@/components/home/MarketPicker";
import ListingGrid from "@/components/listings/ListingGrid";
import { Suspense } from "react";
import ListingGridSkeleton from "@/components/listings/ListingGridSkeleton";
import { TrendingUp, Star, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ListNG — Buy & Sell Across Nigeria's Markets",
  description:
    "Browse listings from verified vendors in Computer Village, Balogun Market, Wuse Market, Onitsha Market and 60+ markets across Nigeria.",
};

export default async function HomePage() {
  // Fetch featured listings
  const featuredListings = await db.listing.findMany({
    where: { status: "ACTIVE", isFeatured: true },
    include: {
      seller: { select: { id: true, name: true, image: true, isFaceVerified: true } },
      market: { select: { name: true, slug: true, city: { select: { name: true, state: { select: { slug: true } } } } } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  }).then(listings => listings.map(l => ({ ...l, price: l.price.toNumber() })));

  // Fetch recent listings
  const recentListings = await db.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      seller: { select: { id: true, name: true, image: true, isFaceVerified: true } },
      market: { select: { name: true, slug: true, city: { select: { name: true, state: { select: { slug: true } } } } } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 16,
  }).then(listings => listings.map(l => ({ ...l, price: l.price.toNumber() })));

  // Fetch categories (top-level only)
  const categories = await db.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 12,
  });

  // Fetch top markets
  const topMarkets = await db.market.findMany({
    include: {
      city: { select: { name: true, state: { select: { name: true, slug: true } } } },
      _count: { select: { listings: true, users: true } },
    },
    orderBy: { listings: { _count: "desc" } },
    take: 8,
  });

  return (
    <div className="min-h-screen">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(25,100%,47%)] via-[hsl(25,95%,40%)] to-[hsl(142,60%,28%)]">
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="section relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 fill-current text-amber-300" />
              60+ Markets · 36 States · Verified Vendors
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              Buy & Sell Across{" "}
              <span className="text-amber-300">Nigeria&apos;s Markets</span>
            </h1>
            <p className="mt-4 text-lg text-white/80 md:text-xl">
              Discover verified vendors in Computer Village, Balogun, Alaba, Wuse Market and every major market in Nigeria.
            </p>
            <div className="mt-8">
              <HeroSearch />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white/60">
              <span>🔒 Verified sellers</span>
              <span>·</span>
              <span>📍 Market-based listings</span>
              <span>·</span>
              <span>💬 Direct messaging</span>
              <span>·</span>
              <span>🇳🇬 Pay with Paystack</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Market Picker ─── */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="section py-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--foreground)]">
                Browse by Market
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Find vendors near you by selecting a market
              </p>
            </div>
            <Link
              href="/markets"
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              See all markets →
            </Link>
          </div>
          <MarketPicker markets={topMarkets} />
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="bg-[color-mix(in_srgb,var(--muted),transparent 50%)] py-10">
        <div className="section">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Browse by Category</h2>
            <Link href="/categories" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              All categories →
            </Link>
          </div>
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* ─── Featured Listings ─── */}
      {featuredListings.length > 0 && (
        <section className="py-10">
          <div className="section">
            <div className="mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <h2 className="font-display text-xl font-bold">Featured Listings</h2>
            </div>
            <Suspense fallback={<ListingGridSkeleton count={8} />}>
              <ListingGrid listings={featuredListings} />
            </Suspense>
          </div>
        </section>
      )}

      {/* ─── Recent Listings ─── */}
      <section className="bg-[color-mix(in_srgb,var(--muted),transparent 30%)] py-10">
        <div className="section">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
              <h2 className="font-display text-xl font-bold">Recent Listings</h2>
            </div>
            <Link href="/search" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              View all →
            </Link>
          </div>
          <Suspense fallback={<ListingGridSkeleton count={16} />}>
            <ListingGrid listings={recentListings} />
          </Suspense>
        </div>
      </section>

      {/* ─── Seller CTA ─── */}
      <section className="bg-gradient-to-r from-[var(--color-secondary)] to-[hsl(142,65%,22%)] py-16">
        <div className="section text-center">
          <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl">
            Ready to Start Selling?
          </h2>
          <p className="mt-3 text-lg text-white/70">
            Join 10,000+ vendors already selling across Nigeria&apos;s markets
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register?type=individual"
              className="rounded-xl bg-white px-8 py-3.5 font-semibold text-[var(--color-secondary)] shadow-lg transition-transform hover:scale-105"
            >
              Register as Individual
            </Link>
            <Link
              href="/register?type=vendor"
              className="rounded-xl border-2 border-white/40 bg-transparent px-8 py-3.5 font-semibold text-white transition-all hover:bg-white/10"
            >
              Register as Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
