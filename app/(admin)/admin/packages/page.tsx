export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { AdminPackagesClient } from "@/components/admin/AdminPackagesClient";

export default async function AdminPackagesPage() {
  const packages = await db.package.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { subscriptions: true } } },
  });

  const rows = packages.map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    price: p.price.toNumber(),
    durationDays: p.durationDays,
    maxListings: p.maxListings,
    boostFrequencyHours: p.boostFrequencyHours,
    heroSpotsPerMonth: p.heroSpotsPerMonth,
    featuredSlotsPerMonth: p.featuredSlotsPerMonth,
    isActive: p.isActive,
    isFree: p.isFree,
    isPopular: p.isPopular,
    subscribers: p._count.subscriptions,
  }));

  return <AdminPackagesClient packages={rows} />;
}