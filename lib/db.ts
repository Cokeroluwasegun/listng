import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined;
}

function createAdapter(connectionString: string) {
  // Neon serverless requires the Neon WebSocket protocol; use the
  // pg driver adapter for plain PostgreSQL (local dev, other hosts).
  if (connectionString.includes("neon.tech")) {
    return new PrismaNeon({ connectionString });
  }
  return new PrismaPg({ connectionString });
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
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

export const db = global.__db ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__db = db;
}