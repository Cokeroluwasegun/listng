import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRedis } from "@/lib/rate-limit";
import { logger, newRequestId } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CheckResult {
  name: string;
  ok: boolean;
  latencyMs: number;
  error?: string;
}

async function timed<T>(name: string, fn: () => Promise<T>): Promise<CheckResult> {
  const start = Date.now();
  try {
    await fn();
    return { name, ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      name,
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET() {
  const requestId = newRequestId();
  const checks = await Promise.all([
    timed("db", async () => {
      await db.$queryRaw`SELECT 1`;
    }),
    timed("redis", async () => {
      const r = getRedis();
      if (!r) throw new Error("Upstash not configured");
      await r.ping();
    }),
  ]);
  const allOk = checks.every((c) => c.ok);
  const body = { status: allOk ? "ready" : "degraded", requestId, checks };
  if (!allOk) logger.warn("Readiness check failed", { requestId, failed: checks.filter((c) => !c.ok) });
  return NextResponse.json(body, { status: allOk ? 200 : 503 });
}
