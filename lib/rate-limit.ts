import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

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

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterMs: number;
  limit: number;
  reset: number;
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
    limiter: Ratelimit.fixedWindow(limit, `${windowMs} ms`),
    prefix,
    analytics: true,
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
