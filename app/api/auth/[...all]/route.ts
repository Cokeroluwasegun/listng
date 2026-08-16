import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const { GET: authGet, POST: authPost } = toNextJsHandler(auth);

// Rate-limit credential endpoints (login / signup) to slow brute-force
// attempts. The register/* custom routes have their own limits.
const SENSITIVE_PATHS = new Set([
  "/api/auth/sign-in/email",
  "/api/auth/sign-in/social",
  "/api/auth/sign-up/email",
]);

export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (SENSITIVE_PATHS.has(pathname)) {
    const key = `auth:${pathname}:${getClientIp(request)}`;
    const result = await rateLimit(key, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
          },
        }
      );
    }
  }
  return authPost(request);
}

export async function GET(request: NextRequest) {
  return authGet(request);
}