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

interface LimiterConfig {
  limit: number;
  windowMs: number;
  prefix: string;
}

function getOrCreateLimiter(config: LimiterConfig): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.windowMs}ms`),
    analytics: false,
    prefix: config.prefix,
  });
}

export const authLimiter = { config: { limit: 5, windowMs: 900_000, prefix: "rl:auth" } };
export const authLoginLimiter = { config: { limit: 10, windowMs: 300_000, prefix: "rl:auth:login" } };
export const authRegisterLimiter = { config: { limit: 5, windowMs: 3_600_000, prefix: "rl:auth:register" } };
export const apiLimiter = { config: { limit: 100, windowMs: 60_000, prefix: "rl:api" } };
export const apiWriteLimiter = { config: { limit: 20, windowMs: 3_600_000, prefix: "rl:api:write" } };
export const paymentLimiter = { config: { limit: 10, windowMs: 3_600_000, prefix: "rl:payment" } };
export const messageLimiter = { config: { limit: 60, windowMs: 3_600_000, prefix: "rl:message" } };
export const listingLimiter = { config: { limit: 20, windowMs: 3_600_000, prefix: "rl:listing" } };

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterMs: number;
  limit: number;
  reset: number;
}

export async function limitByName(
  limiterDef: { config: LimiterConfig },
  key: string
): Promise<RateLimitResult> {
  const limiter = getOrCreateLimiter(limiterDef.config);
  if (!limiter) {
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

export async function rateLimit(
  key: string,
  { limit, windowMs, prefix = "rl" }: { limit: number; windowMs: number; prefix?: string }
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
