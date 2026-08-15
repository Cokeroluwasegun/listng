import { NextRequest, NextResponse } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  const base = [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"];
  if (!raw) return base;
  return Array.from(new Set([...base, ...raw.split(",").map((s) => s.trim()).filter(Boolean)]));
}

export function csrfProtect(request: NextRequest): NextResponse | null {
  if (SAFE_METHODS.has(request.method)) return null;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowed = getAllowedOrigins();
  const isAllowed = (url: string | null) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      return allowed.some((a) => {
        try {
          const au = new URL(a);
          return u.origin === au.origin;
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  };
  if (isAllowed(origin) || isAllowed(referer)) return null;
  return NextResponse.json(
    { error: "Forbidden: cross-origin request blocked" },
    { status: 403 }
  );
}
