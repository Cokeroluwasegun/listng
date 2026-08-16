import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addDays } from "date-fns";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createUniqueUsername } from "@/lib/registration";
import { verifyCACNumber } from "@/lib/cac-verification";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const cacVerificationSchema = z.object({
  type: z.string(),
  number: z.string().min(3),
  rawData: z.any().optional(),
});

const vendorRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/),
  password: z.string().min(8),
  businessName: z.string().min(2),
  businessType: z.string().min(1),
  marketId: z.string().min(1),
  streetAddress: z.string().min(5),
  website: z.string().url().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  cacVerification: cacVerificationSchema.optional(),
  faceDescriptor: z.array(z.number()).nullable().optional(),
});

export async function POST(request: NextRequest) {
  const limited = await rateLimit(`register:vendor:${getClientIp(request)}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = vendorRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    name,
    email,
    phone,
    password,
    businessName,
    businessType,
    marketId,
    streetAddress,
    website,
    whatsapp,
    cacVerification,
    faceDescriptor,
  } = parsed.data;

  const market = await db.market.findUnique({ where: { id: marketId } });
  if (!market) {
    return NextResponse.json({ error: "Selected market is invalid" }, { status: 400 });
  }

  const username = await createUniqueUsername(name);

  // Re-verify CAC server-side rather than trusting client-submitted data.
  // If the external provider is unavailable we still create the profile but
  // leave the business unverified (no badge).
  let cacRecord: {
    rcNumber: string;
    companyName?: string;
    companyType?: string;
    status?: string;
    registeredAddress?: string;
    directors?: Prisma.InputJsonValue;
    apiProvider?: string;
    apiResponse?: Prisma.InputJsonValue;
    isVerified: boolean;
    verifiedAt?: Date;
    expiresAt?: Date;
  } | null = null;

  if (cacVerification) {
    const cleanNumber = cacVerification.number.trim().toUpperCase();
    try {
      const result = await verifyCACNumber(cleanNumber, (cacVerification.type.split(" ")[0] as "RC" | "BN" | "IT" | "LLP") || "RC");
      if (result.success && result.data) {
        cacRecord = {
          rcNumber: result.data.rcNumber,
          companyName: result.data.companyName,
          companyType: result.data.companyType,
          status: result.data.status,
          registeredAddress: result.data.registeredAddress,
          directors: result.data.directors as Prisma.InputJsonValue,
          apiProvider: result.provider,
          apiResponse: result.data.rawResponse as Prisma.InputJsonValue,
          isVerified: true,
          verifiedAt: new Date(),
          expiresAt: addDays(new Date(), 180),
        };
      }
    } catch (error) {
      logger.error("CAC verification failed", { err: String(error) });
    }
    if (!cacRecord) {
      cacRecord = {
        rcNumber: cleanNumber,
        companyType: cacVerification.type,
        status: "PENDING",
        isVerified: false,
      };
    }
  }

  try {
    const signUpResponse = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        username,
        phone,
        role: "VENDOR",
        marketId,
        streetAddress,
      },
      asResponse: true,
    });

    const payload = await signUpResponse.json().catch(() => null);
    const userId = payload?.user?.id as string | undefined;

    if (!userId) {
      const code = payload?.code as string | undefined;
      const message = payload?.message as string | undefined;
      const conflict =
        code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
        /already exists|unique constraint|taken/i.test(message ?? "");
      return NextResponse.json(
        { error: conflict ? "An account with this email already exists." : (message ?? "Account creation failed") },
        { status: conflict ? 409 : 422 }
      );
    }

    // Vendor profile + CAC record are the source of truth for a vendor; if
    // they fail we roll back the account so the user can retry cleanly.
    try {
      await db.$transaction(async (tx) => {
        const profile = await tx.vendorProfile.create({
          data: {
            userId,
            businessName,
            businessType,
            website: website || undefined,
            whatsapp: whatsapp || undefined,
          },
        });

        if (cacRecord) {
          await tx.cACVerification.create({
            data: {
              vendorProfileId: profile.id,
              ...cacRecord,
            },
          });
        }
      });
    } catch (error) {
      logger.error("Failed to create vendor profile", { err: String(error) });
      await db.user.delete({ where: { id: userId } }).catch(() => {});
      return NextResponse.json({ error: "Vendor profile creation failed" }, { status: 500 });
    }

    // Store the face descriptor + mark identity verified (best-effort).
    if (faceDescriptor && faceDescriptor.length === 128) {
      await db.user
        .update({
          where: { id: userId },
          data: { faceDescriptor, isFaceVerified: true },
        })
        .catch((error) => {
          logger.error("Failed to store face descriptor", { err: String(error) });
        });
    }

    const response = NextResponse.json({ success: true, userId }, { status: 201 });
    forwardCookies(signUpResponse, response);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    const conflict = /already exists|unique constraint|taken/i.test(message);
    return NextResponse.json(
      { error: conflict ? "An account with this email already exists." : message },
      { status: conflict ? 409 : 500 }
    );
  }
}

function forwardCookies(source: Response, target: NextResponse) {
  try {
    if (typeof source.headers.getSetCookie === "function") {
      source.headers.getSetCookie().forEach((cookie) => {
        target.headers.append("Set-Cookie", cookie);
      });
    }
  } catch {
    // Session cookies couldn't be forwarded — the user can still sign in manually.
  }
}