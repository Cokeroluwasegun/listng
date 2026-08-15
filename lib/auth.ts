import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  getDeviceHash,
  recordLoginAttempt,
  trustDevice,
} from "@/lib/risk-engine";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,              // 5 minutes
    },
  },
  user: {
    additionalFields: {
      username: { type: "string", required: true },
      phone: { type: "string", required: false },
      role: { type: "string", defaultValue: "INDIVIDUAL" },
      marketId: { type: "string", required: false },
      streetAddress: { type: "string", required: false },
      faceDescriptor: { type: "string[]", required: false },
      isFaceVerified: { type: "boolean", defaultValue: false },
      isActive: { type: "boolean", defaultValue: true },
      isSuspended: { type: "boolean", defaultValue: false },
    },
  },
  // Central side effects that run for EVERY signup/signin path
  // (including the raw /api/auth/* endpoints), so we never end up with
  // users lacking a subscription or un-tracked devices.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await ensureFreeSubscription(user.id);
          } catch (error) {
            logger.error("Failed to create free subscription", { err: String(error) });
          }
        },
      },
    },
    session: {
      create: {
        // Block suspended users before a session (and thus a login) is created.
        before: async (session) => {
          try {
            const user = await db.user.findUnique({
              where: { id: session.userId },
              select: { isSuspended: true },
            });
            if (user?.isSuspended) return false;
          } catch (error) {
            logger.error("Failed to check suspension status", { err: String(error) });
          }
        },
        after: async (session, context) => {
          try {
            await trackSessionCreated(session, context);
          } catch (error) {
            logger.error("Failed to record login history", { err: String(error) });
          }
        },
      },
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
});

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function ensureFreeSubscription(userId: string) {
  const existing = await db.userSubscription.findUnique({
    where: { userId },
  });
  if (existing) return;

  const freePackage = await db.package.findFirst({
    where: { isFree: true, isActive: true },
  });
  if (!freePackage) {
    logger.warn("No free package found — skipping subscription creation");
    return;
  }

  await db.userSubscription.create({
    data: {
      userId,
      packageId: freePackage.id,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: addDays(new Date(), freePackage.durationDays),
    },
  });
}

function readRequestHeaders(
  context: unknown
): { userAgent: string | null; ip: string | null; country: string | null; city: string | null } {
  try {
    const ctx = context as {
      request?: Request;
      headers?: Headers;
    };
    const headers = ctx?.request?.headers ?? ctx?.headers ?? new Headers();
    const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headers.get("x-real-ip") ?? null;
    return {
      userAgent: headers.get("user-agent"),
      ip,
      country: headers.get("x-vercel-ip-country") ?? null,
      city: headers.get("x-vercel-ip-city") ?? null,
    };
  } catch {
    return { userAgent: null, ip: null, country: null, city: null };
  }
}

async function trackSessionCreated(
  session: { userId: string; userAgent?: string | null; ipAddress?: string | null },
  context: unknown
) {
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true },
  });
  if (!user) return;

  const { userAgent, ip, country, city } = readRequestHeaders(context);
  const resolvedIp = ip ?? session.ipAddress ?? null;
  const deviceHash = getDeviceHash(userAgent ?? session.userAgent, resolvedIp);

  await recordLoginAttempt({
    userId: user.id,
    email: user.email,
    ip: resolvedIp,
    country,
    city,
    deviceHash,
    userAgent: userAgent ?? session.userAgent ?? null,
    status: "SUCCESS",
    riskScore: 0,
  });

  await trustDevice(user.id, deviceHash, userAgent ?? session.userAgent, resolvedIp);
}

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
