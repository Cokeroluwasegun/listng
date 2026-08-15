// CAC Verification via Prembly API (primary) with Dojah fallback
// Docs: https://docs.prembly.com/

import { logger } from "@/lib/logger";

export interface CACVerificationResult {
  success: boolean;
  provider: "prembly" | "dojah" | "error";
  data?: {
    companyName: string;
    rcNumber: string;
    companyType: string;
    status: string;
    registrationDate?: string;
    registeredAddress?: string;
    directors?: Array<{ name: string }>;
    rawResponse: unknown;
  };
  error?: string;
}

export async function verifyCACNumber(
  rcNumber: string,
  companyType: "RC" | "BN" | "IT" | "LLP" = "RC"
): Promise<CACVerificationResult> {
  // Try Prembly first
  try {
    const result = await verifyWithPrembly(rcNumber, companyType);
    if (result.success) return result;
  } catch (err) {
    logger.error("Prembly failed, trying Dojah", { err: String(err) });
  }

  // Fallback to Dojah
  try {
    const result = await verifyWithDojah(rcNumber);
    if (result.success) return result;
  } catch (err) {
    logger.error("Dojah also failed", { err: String(err) });
  }

  return {
    success: false,
    provider: "error",
    error: "Unable to verify CAC number at this time. Please try again later.",
  };
}

async function verifyWithPrembly(
  rcNumber: string,
  companyType: string
): Promise<CACVerificationResult> {
  const apiKey = process.env.PREMBLY_API_KEY;
  const appId = process.env.PREMBLY_APP_ID;

  if (!apiKey || !appId || apiKey === "placeholder") {
    throw new Error("Prembly API keys not configured");
  }

  const response = await fetch(
    "https://api.prembly.com/identitypass/verification/nigeria/cac",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "app-id": appId,
      },
      body: JSON.stringify({
        rc_number: rcNumber,
        company_type: companyType,
      }),
    }
  );

  const json = await response.json();

  if (!response.ok || !json.status) {
    throw new Error(json.message || "Prembly verification failed");
  }

  const d = json.data;
  return {
    success: true,
    provider: "prembly",
    data: {
      companyName: d.company_name || d.business_name,
      rcNumber: d.rc_number || rcNumber,
      companyType: d.company_type || companyType,
      status: d.status || "Unknown",
      registrationDate: d.registration_date,
      registeredAddress: d.address,
      directors: d.directors?.map((dir: { name?: string; firstname?: string; surname?: string }) => ({
        name: dir.name || `${dir.firstname} ${dir.surname}`.trim(),
      })),
      rawResponse: json,
    },
  };
}

async function verifyWithDojah(rcNumber: string): Promise<CACVerificationResult> {
  const appId = process.env.DOJAH_APP_ID;
  const secretKey = process.env.DOJAH_SECRET_KEY;

  if (!appId || !secretKey || appId === "placeholder") {
    throw new Error("Dojah API keys not configured");
  }

  const response = await fetch(
    `https://api.dojah.io/api/v1/kyb/cac?rc_number=${encodeURIComponent(rcNumber)}`,
    {
      method: "GET",
      headers: {
        AppId: appId,
        SecretKey: secretKey,
      },
    }
  );

  const json = await response.json();

  if (!response.ok || !json.entity) {
    throw new Error(json.error || "Dojah verification failed");
  }

  const d = json.entity;
  return {
    success: true,
    provider: "dojah",
    data: {
      companyName: d.company_name || d.business_name,
      rcNumber: d.rc_number || rcNumber,
      companyType: d.company_type || "RC",
      status: d.status || "Unknown",
      registrationDate: d.registration_date,
      registeredAddress: d.address,
      directors: d.directors?.map((dir: { name?: string }) => ({ name: dir.name })),
      rawResponse: json,
    },
  };
}
