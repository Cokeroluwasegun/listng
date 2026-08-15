import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import {
  NIGERIAN_STATES,
  CITIES_AND_MARKETS,
  CATEGORIES,
  PACKAGES,
} from "../lib/nigeria-data";

const connectionString = process.env.DATABASE_URL!;
const adapter = connectionString.includes("neon.tech")
  ? new PrismaNeon({ connectionString })
  : new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

// Hash passwords with the same scrypt format better-auth uses so seeded
// users (e.g. the admin) can actually log in:
//   `${salt}:${key}` where both are hex, N=16384, r=16, p=1, dkLen=64
const scryptAsync = promisify(scrypt) as (password: string, salt: string, keylen: number, options: object) => Promise<Buffer>;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${key.toString("hex")}`;
}

async function main() {
  console.log("🌱 Seeding ListNG database...\n");

  // ─── 1. States ─────────────────────────────────────
  console.log("📍 Seeding states...");
  for (const state of NIGERIAN_STATES) {
    await prisma.state.upsert({
      where: { slug: state.slug },
      update: {},
      create: { name: state.name, slug: state.slug },
    });
  }
  console.log(`  ✓ ${NIGERIAN_STATES.length} states seeded`);

  // ─── 2. Cities & Markets ────────────────────────────
  console.log("🏙️  Seeding cities and markets...");
  let totalMarkets = 0;
  for (const cityData of CITIES_AND_MARKETS) {
    const state = await prisma.state.findUnique({ where: { name: cityData.stateName } });
    if (!state) {
      console.warn(`  ⚠ State not found: ${cityData.stateName}`);
      continue;
    }

    const city = await prisma.city.upsert({
      where: { slug_stateId: { slug: cityData.slug, stateId: state.id } },
      update: { name: cityData.name, lga: cityData.lga },
      create: {
        name: cityData.name,
        slug: cityData.slug,
        lga: cityData.lga,
        stateId: state.id,
      },
    });

    for (const market of cityData.markets) {
      await prisma.market.upsert({
        where: { slug_cityId: { slug: market.slug, cityId: city.id } },
        update: { name: market.name, description: market.description, specialty: market.specialty },
        create: {
          name: market.name,
          slug: market.slug,
          description: market.description,
          specialty: market.specialty,
          cityId: city.id,
        },
      });
      totalMarkets++;
    }
  }
  console.log(`  ✓ ${CITIES_AND_MARKETS.length} cities and ${totalMarkets} markets seeded`);

  // ─── 3. Categories ──────────────────────────────────
  console.log("📂 Seeding categories...");
  let totalCategories = 0;
  for (const cat of CATEGORIES) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: totalCategories,
      },
    });
    totalCategories++;

    if (cat.children) {
      for (const child of cat.children) {
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: { name: child.name, icon: child.icon },
          create: {
            name: child.name,
            slug: child.slug,
            icon: child.icon,
            parentId: parent.id,
            sortOrder: totalCategories,
          },
        });
        totalCategories++;
      }
    }
  }
  console.log(`  ✓ ${totalCategories} categories seeded`);

  // ─── 4. Packages ───────────────────────────────────
  console.log("📦 Seeding packages...");
  for (const pkg of PACKAGES) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {
        name: pkg.name,
        tagline: pkg.tagline,
        price: pkg.price,
        durationDays: pkg.durationDays,
        maxListings: pkg.maxListings,
        boostFrequencyHours: pkg.boostFrequencyHours,
        heroSpotsPerMonth: pkg.heroSpotsPerMonth,
        featuredSlotsPerMonth: pkg.featuredSlotsPerMonth,
        badge: pkg.badge,
        badgeColor: pkg.badgeColor,
        isFree: pkg.isFree,
        isPopular: pkg.isPopular,
        sortOrder: pkg.sortOrder,
        features: pkg.features,
      },
      create: {
        name: pkg.name,
        slug: pkg.slug,
        tagline: pkg.tagline,
        price: pkg.price,
        durationDays: pkg.durationDays,
        maxListings: pkg.maxListings,
        boostFrequencyHours: pkg.boostFrequencyHours,
        heroSpotsPerMonth: pkg.heroSpotsPerMonth,
        featuredSlotsPerMonth: pkg.featuredSlotsPerMonth,
        badge: pkg.badge,
        badgeColor: pkg.badgeColor,
        isFree: pkg.isFree,
        isPopular: pkg.isPopular,
        sortOrder: pkg.sortOrder,
        features: pkg.features,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ ${PACKAGES.length} packages seeded`);

  // ─── 5. Admin User ──────────────────────────────────
  console.log("👤 Seeding admin user...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@listng.com.ng";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@ListNG2025!";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "ListNG Admin",
        username: "listng-admin",
        role: "ADMIN",
        isActive: true,
        isFaceVerified: false,
        accounts: {
          create: {
            providerId: "credential",
            accountId: adminEmail,
            password: hashedPassword,
          },
        },
      },
    });
    console.log(`  ✓ Admin created: ${adminEmail}`);
  } else {
    // Ensure the admin's password uses the current (better-auth scrypt) scheme.
    const hashedPassword = await hashPassword(adminPassword);
    await prisma.account.updateMany({
      where: { userId: existingAdmin.id, providerId: "credential" },
      data: { password: hashedPassword },
    });
    console.log(`  ✓ Admin password refreshed: ${adminEmail}`);
  }

  // ─── 6. Site Settings ──────────────────────────────
  console.log("⚙️  Seeding site settings...");
  const defaultSettings = [
    { key: "site_name", value: "ListNG", type: "string", label: "Site Name" },
    { key: "site_tagline", value: "Buy & Sell Across Nigeria's Markets", type: "string", label: "Tagline" },
    { key: "maintenance_mode", value: "false", type: "boolean", label: "Maintenance Mode" },
    { key: "listing_approval_required", value: "true", type: "boolean", label: "Listings Require Admin Approval" },
    { key: "contact_email", value: "support@listng.com.ng", type: "string", label: "Support Email" },
    { key: "max_listing_images", value: "10", type: "number", label: "Max Images per Listing" },
    { key: "announcement_banner", value: "", type: "string", label: "Homepage Announcement Banner" },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`  ✓ ${defaultSettings.length} site settings seeded`);

  console.log("\n✅ Database seeded successfully!");
  console.log(`
  Summary:
  • ${NIGERIAN_STATES.length} states
  • ${CITIES_AND_MARKETS.length} cities
  • ${totalMarkets} markets
  • ${totalCategories} categories
  • ${PACKAGES.length} packages
  • 1 admin user (${adminEmail})
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
