// Suspicious Login Risk Engine
// Scores login attempts 0-100 based on security signals
// 0-30: Normal login | 31-70: OTP required | 71+: Face re-verification required

import { createHash } from "crypto";
import { db } from "@/lib/db";

// Stable device fingerprint derived from the user agent + IP.
export function getDeviceHash(
  userAgent: string | null | undefined,
  ip: string | null | undefined
): string {
  return createHash("sha256")
    .update(`${userAgent ?? "unknown-agent"}|${ip ?? "unknown-ip"}`)
    .digest("hex")
    .slice(0, 32);
}

export interface LoginContext {
  userId: string;
  email: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  deviceHash: string;
  userAgent: string | null;
  isDatacenterIp?: boolean;
  isVpn?: boolean;
}

export interface RiskResult {
  score: number;
  level: "normal" | "otp" | "face";
  reasons: string[];
}

export async function calculateLoginRisk(context: LoginContext): Promise<RiskResult> {
  let score = 0;
  const reasons: string[] = [];

  // 1. Check if device is known
  const knownDevice = await db.userDevice.findUnique({
    where: {
      userId_deviceHash: {
        userId: context.userId,
        deviceHash: context.deviceHash,
      },
    },
  });

  if (!knownDevice) {
    score += 35;
    reasons.push("Unrecognized device");
  }

  // 2. VPN / Proxy / Datacenter IP
  if (context.isVpn || context.isDatacenterIp) {
    score += 30;
    reasons.push("VPN or proxy detected");
  }

  // 3. Get last successful login for geo-velocity check
  const lastLogin = await db.loginHistory.findFirst({
    where: {
      userId: context.userId,
      status: "SUCCESS",
    },
    orderBy: { createdAt: "desc" },
  });

  // 4. Country change (simple check)
  if (lastLogin?.country && context.country && lastLogin.country !== context.country) {
    score += 20;
    reasons.push(`Login from new country (${context.country})`);
  }

  // 5. Recent failed attempts (brute force detection)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const recentFailures = await db.loginHistory.count({
    where: {
      email: context.email,
      status: "FAILED",
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  if (recentFailures >= 3) {
    score += 25;
    reasons.push(`${recentFailures} failed login attempts in last 15 minutes`);
  }

  // Determine risk level
  const level: RiskResult["level"] =
    score >= 71 ? "face" : score >= 31 ? "otp" : "normal";

  return { score: Math.min(score, 100), level, reasons };
}

export async function recordLoginAttempt(
  context: LoginContext & { status: string; riskScore: number }
) {
  await db.loginHistory.create({
    data: {
      userId: context.userId,
      email: context.email,
      ip: context.ip,
      country: context.country,
      city: context.city,
      deviceHash: context.deviceHash,
      userAgent: context.userAgent,
      riskScore: context.riskScore,
      status: context.status as "SUCCESS" | "TRIGGERED_OTP" | "TRIGGERED_FACE" | "FAILED" | "BLOCKED",
    },
  });
}

export async function trustDevice(userId: string, deviceHash: string, userAgent?: string | null, ip?: string | null) {
  await db.userDevice.upsert({
    where: { userId_deviceHash: { userId, deviceHash } },
    create: {
      userId,
      deviceHash,
      userAgent,
      lastIp: ip || undefined,
      isTrusted: true,
      lastUsedAt: new Date(),
    },
    update: {
      lastUsedAt: new Date(),
      isTrusted: true,
      lastIp: ip || undefined,
    },
  });
}
