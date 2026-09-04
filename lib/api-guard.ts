import { NextRequest, NextResponse } from "next/server";
import { auth as betterAuth } from "@/lib/auth";
import { csrfProtect } from "@/lib/csrf";
import { logger } from "@/lib/logger";
import { getOrAssignRequestId, withRequestIdHeader } from "@/lib/request-id";

export type RouteContext = "public" | "protected" | "admin";

export interface GuardOptions {
  routeContext?: RouteContext;
  csrf?: boolean;
}

export interface GuardedRequest {
  request: NextRequest;
  session: Awaited<ReturnType<typeof betterAuth.api.getSession>>;
  user: NonNullable<Awaited<ReturnType<typeof betterAuth.api.getSession>>>["user"] | null;
  requestId: string;
}

function jsonError(requestId: string, status: number, error: string): NextResponse {
  return withRequestIdHeader(NextResponse.json({ error, requestId }, { status }), requestId);
}

export async function guardRequest(
  request: NextRequest,
  options: GuardOptions = {}
): Promise<{ ok: true; data: GuardedRequest } | { ok: false; response: NextResponse }> {
  const requestId = getOrAssignRequestId(request);

  if (options.csrf ?? true) {
    const blocked = csrfProtect(request);
    if (blocked) return { ok: false, response: withRequestIdHeader(blocked, requestId) };
  }

  const session = await betterAuth.api.getSession({ headers: request.headers });

  if (options.routeContext === "admin") {
    if (!session) return { ok: false, response: jsonError(requestId, 401, "Unauthorized") };
    if (session.user.role !== "ADMIN") return { ok: false, response: jsonError(requestId, 403, "Forbidden") };
  } else if (options.routeContext === "protected") {
    if (!session) return { ok: false, response: jsonError(requestId, 401, "Unauthorized") };
    if (session.user.isSuspended) return { ok: false, response: jsonError(requestId, 403, "Account suspended") };
  }

  return {
    ok: true,
    data: {
      request,
      session,
      user: session?.user ?? null,
      requestId,
    },
  };
}

export function handleApiError(requestId: string, error: unknown) {
  logger.error("Unhandled API error", { requestId, err: String(error) });
  return NextResponse.json(
    { error: "Internal server error", requestId },
    { status: 500 }
  );
}
