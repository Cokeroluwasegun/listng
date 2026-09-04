import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _redis = null;
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

function getOrCreateRedis(): Redis {
  const r = getRedis();
  if (!r) throw new Error("Upstash Redis not configured");
  return r;
}

// ─────────────────────────────────────────────
// Named limiters — preferred for new code
// Each has its own Redis prefix + sliding window
// ─────────────────────────────────────────────

export const authLimiter = new Ratelimit({
  redis: getOrCreateRedis(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "rl:auth",
});

export const authLoginLimiter = new Ratelimit({
  redis: getOrCreateRedis(),
  limiter: Ratelimit.slidingWindow(10, "5 m"),
  analytics: true,
  prefix: "rl:auth:login",
});

export const authRegisterLimiter = new Ratelimit({
  redis: getOrCreateRedis(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "rl:auth:register",
});

export const apiLimiter = new Ratelimit({
  redis: getOrCreateRedis(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "rl:api",
});

export const apiWriteLimiter = new Ratelimit({
  redis: getOrCreateRedis(),
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
  prefix: "rl:api:write",
});

export const paymentLimiter = new Ratelimit({
  redis: getOrCreateRedis(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "rl:payment",
});

export const messageLimiter = new Ratelimit({
  redis: getOrCreateRedis(),
  limiter: Ratelimit.slidingWindow(60, "1 h"),
  analytics: true,
  prefix: "rl:message",
});

export const listingLimiter = new Ratelimit({
  redis: getOrCreateRedis(),
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
  prefix: "rl:listing",
});

// ─────────────────────────────────────────────
// Named limiter helper — falls back to no-op when Redis unavailable
// ─────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterMs: number;
  limit: number;
  reset: number;
}

export async function limitByName(
  limiter: Ratelimit,
  key: string
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    return { success: true, remaining: 999, retryAfterMs: 0, limit: 999, reset: Date.now() + 60_000 };
  }
  const r = await limiter.limit(key);
  return {
    success: r.success,
    remaining: r.remaining,
    retryAfterMs: Math.max(0, r.reset - Date.now()),
    limit: r.limit,
    reset: r.reset,
  };
}

// ─────────────────────────────────────────────
// Legacy API — kept for backward compatibility with existing call sites
// ─────────────────────────────────────────────

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  prefix?: string;
}

export async function rateLimit(
  key: string,
  { limit, windowMs, prefix = "rl" }: RateLimitOptions
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    return { success: true, remaining: limit, retryAfterMs: 0, limit, reset: Date.now() + windowMs };
  }
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
    prefix,
    analytics: false,
  });
  const r = await limiter.limit(key);
  return {
    success: r.success,
    remaining: r.remaining,
    retryAfterMs: Math.max(0, r.reset - Date.now()),
    limit: r.limit,
    reset: r.reset,
  };
}

export function getClientIp(request: Request): string {
  const headers = request.headers;
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") || "unknown";
}
