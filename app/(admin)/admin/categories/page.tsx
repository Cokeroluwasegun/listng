import { db } from "@/lib/db";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { listings: true } },
      children: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { listings: true } } },
      },
    },
  });

  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    active: c.isActive,
    count: c._count.listings,
    children: c.children.map((ch) => ({
      id: ch.id,
      name: ch.name,
      slug: ch.slug,
      active: ch.isActive,
      count: ch._count.listings,
    })),
  }));

  return <AdminCategoriesClient categories={rows} />;
}