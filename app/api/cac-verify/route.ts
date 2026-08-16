import { NextRequest, NextResponse } from "next/server";
import { verifyCACNumber } from "@/lib/cac-verification";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Must be authenticated
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { rcNumber, companyType } = body;

  if (!rcNumber || typeof rcNumber !== "string") {
    return NextResponse.json({ error: "RC number is required" }, { status: 400 });
  }

  const cleanRcNumber = rcNumber.trim().toUpperCase();

  // Check if this RC number was already verified recently (cache)
  const cached = await db.cACVerification.findFirst({
    where: {
      rcNumber: cleanRcNumber,
      isVerified: true,
      expiresAt: { gt: new Date() },
    },
  });

  if (cached) {
    return NextResponse.json({
      success: true,
      cached: true,
      data: {
        companyName: cached.companyName,
        rcNumber: cached.rcNumber,
        companyType: cached.companyType,
        status: cached.status,
        directors: cached.directors,
        registeredAddress: cached.registeredAddress,
      },
    });
  }

  // Call external API
  const result = await verifyCACNumber(
    cleanRcNumber,
    companyType || "RC"
  );

  if (!result.success || !result.data) {
    return NextResponse.json(
      { success: false, error: result.error || "Verification failed" },
      { status: 422 }
    );
  }

  return NextResponse.json({
    success: true,
    cached: false,
    data: {
      companyName: result.data.companyName,
      rcNumber: result.data.rcNumber,
      companyType: result.data.companyType,
      status: result.data.status,
      directors: result.data.directors,
      registeredAddress: result.data.registeredAddress,
    },
  });
}
