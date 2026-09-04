import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __db: PrismaClient | undefined;
}

function createAdapter(connectionString: string) {
  if (connectionString.includes("neon.tech")) {
    return new PrismaNeon({ connectionString });
  }
  return new PrismaPg({ connectionString });
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("[db] DATABASE_URL not set, returning null client");
    return null as unknown as PrismaClient;
  }

  const adapter = createAdapter(connectionString);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = globalThis as unknown as {
  __db: PrismaClient | undefined;
};

export const db = globalForPrisma.__db ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__db = db;
}
