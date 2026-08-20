import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { csrfProtect } from "@/lib/csrf";
import { getOrAssignRequestId, withRequestIdHeader } from "@/lib/request-id";

const PROTECTED_ROUTES = ["/dashboard", "/messages", "/listings/create"];
const VENDOR_ROUTES = ["/dashboard/analytics", "/dashboard/hero-spots"];
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = getOrAssignRequestId(request);

  // CSRF: block cross-origin unsafe methods on page navigations too.
  if (!pathname.startsWith("/api/")) {
    const blocked = csrfProtect(request);
    if (blocked) return withRequestIdHeader(blocked, requestId);
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (pathname.startsWith("/admin")) {
    if (!session) return withRequestIdHeader(redirectToLogin(request, pathname), requestId);
    if (session.user.role !== "ADMIN") {
      return withRequestIdHeader(NextResponse.redirect(new URL("/", request.url)), requestId);
    }
    return withRequestIdHeader(NextResponse.next(), requestId);
  }

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !session) {
    return withRequestIdHeader(redirectToLogin(request, pathname), requestId);
  }

  const isVendorOnly = VENDOR_ROUTES.some((route) => pathname.startsWith(route));
  if (isVendorOnly && session && session.user.role === "INDIVIDUAL") {
    return withRequestIdHeader(NextResponse.redirect(new URL("/dashboard", request.url)), requestId);
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && session) {
    return withRequestIdHeader(NextResponse.redirect(new URL("/dashboard", request.url)), requestId);
  }

  return withRequestIdHeader(NextResponse.next(), requestId);
}

function redirectToLogin(request: NextRequest, from: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("callbackUrl", from);
  return NextResponse.redirect(url);
}

export const config = {
  // Only run on page routes we care about — NOT on /api/* or static assets,
  // so we avoid a DB session lookup on every asset/API request.
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/messages/:path*",
    "/listings/create/:path*",
    "/login",
    "/register/:path*",
  ],
};