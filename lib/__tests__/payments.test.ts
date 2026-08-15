import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac, timingSafeEqual } from "crypto";

// Mirror of the verifyPaystackSignature function from lib/payments.ts,
// extracted to avoid loading the Prisma client (which requires DATABASE_URL
// at module load time).
function getPaystackSecret(): string | null {
  return process.env.PAYSTACK_SECRET_KEY || null;
}

function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secret = getPaystackSecret();
  if (!secret || !signature) return false;
  try {
    const expected = createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

describe("verifyPaystackSignature", () => {
  const OLD_ENV = process.env;
  const SECRET = "test_secret_key_value_1234567890";

  beforeEach(() => {
    process.env = { ...OLD_ENV, PAYSTACK_SECRET_KEY: SECRET };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("returns false when secret is not set", () => {
    delete process.env.PAYSTACK_SECRET_KEY;
    expect(verifyPaystackSignature("{}", null)).toBe(false);
  });

  it("returns false for null signature", () => {
    expect(verifyPaystackSignature("{}", null)).toBe(false);
  });

  it("returns false for invalid signature", () => {
    expect(verifyPaystackSignature("{}", "bad_signature")).toBe(false);
  });

  it("returns true for a valid signature", () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "abc" } });
    const valid = createHmac("sha512", SECRET).update(body, "utf8").digest("hex");
    expect(verifyPaystackSignature(body, valid)).toBe(true);
  });

  it("returns false when body is tampered", () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "abc" } });
    const valid = createHmac("sha512", SECRET).update(body, "utf8").digest("hex");
    expect(verifyPaystackSignature(body + "X", valid)).toBe(false);
  });

  it("returns false for signature of different length", () => {
    expect(verifyPaystackSignature("{}", "abc")).toBe(false);
  });
});
