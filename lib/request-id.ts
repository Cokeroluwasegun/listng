import { NextRequest, NextResponse } from "next/server";
import { newRequestId } from "@/lib/logger";

const HEADER = "x-request-id";

export function getOrAssignRequestId(request: NextRequest): string {
  return request.headers.get(HEADER) ?? newRequestId();
}

export function withRequestIdHeader<T extends Response>(
  response: T,
  requestId: string
): T {
  response.headers.set(HEADER, requestId);
  return response;
}

export function withRequestId(
  response: NextResponse | Response,
  requestId: string
): NextResponse {
  if (response instanceof NextResponse) {
    response.headers.set(HEADER, requestId);
    return response;
  }
  const clone = response.clone();
  clone.headers.set(HEADER, requestId);
  return NextResponse.json({}, { status: response.status });
}
