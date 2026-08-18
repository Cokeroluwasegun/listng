import { db } from "@/lib/db";
import { AdminMarketsClient } from "@/components/admin/AdminMarketsClient";

export default async function AdminMarketsPage() {
  const markets = await db.market.findMany({
    orderBy: { name: "asc" },
    include: {
      city: { include: { state: true } },
      _count: { select: { users: true, listings: true } },
    },
  });

  const rows = markets.map((m) => ({
    id: m.id,
    name: m.name,
    city: m.city.name,
    state: m.city.state.name,
    specialty: m.specialty,
    sellers: m._count.users,
    listings: m._count.listings,
  }));

  return <AdminMarketsClient markets={rows} />;
}