import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "listng",
    time: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.0.0",
  });
}
