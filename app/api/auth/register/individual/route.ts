import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createUniqueUsername } from "@/lib/registration";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/),
  password: z.string().min(8),
  marketId: z.string().min(1),
  streetAddress: z.string().min(5),
  faceDescriptor: z.array(z.number()).nullable().optional(),
});

export async function POST(request: NextRequest) {
  const limited = await rateLimit(`register:individual:${getClientIp(request)}`, {
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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, phone, password, marketId, streetAddress, faceDescriptor } = parsed.data;

  const market = await db.market.findUnique({ where: { id: marketId } });
  if (!market) {
    return NextResponse.json({ error: "Selected market is invalid" }, { status: 400 });
  }

  const username = await createUniqueUsername(name);

  try {
    // Create the user + session via better-auth. `asResponse: true` returns a
    // Response carrying the session cookies, which we forward to the client.
    const signUpResponse = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        username,
        phone,
        role: "INDIVIDUAL",
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

    // Store the face descriptor + mark identity verified (best-effort; the
    // account is already usable if this fails).
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