import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://listng.com.ng";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/markets`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await db.category.findMany({
      where: { isActive: true, parentId: null },
      select: { slug: true },
    });
    categoryRoutes = categories.map((c) => ({
      url: `${BASE}/search?category=${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB not available in build context
  }

  let marketRoutes: MetadataRoute.Sitemap = [];
  try {
    const markets = await db.market.findMany({
      select: { slug: true },
      take: 200,
    });
    marketRoutes = markets.map((m) => ({
      url: `${BASE}/markets/${m.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB not available
  }

  return [...staticRoutes, ...categoryRoutes, ...marketRoutes];
}
