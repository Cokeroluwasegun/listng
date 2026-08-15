import { logger } from "@/lib/logger";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_HOSTS = new Set([
  "utfs.io",
  "uploadthing.com",
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "res.cloudinary.com",
]);

export interface ImageCheckResult {
  ok: boolean;
  reason?: string;
}

export async function validateImageUrl(url: string): Promise<ImageCheckResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (parsed.protocol !== "https:") return { ok: false, reason: "non_https" };
  if (!ALLOWED_HOSTS.has(parsed.hostname)) return { ok: false, reason: "host_not_allowed" };

  const start = Date.now();
  try {
    const head = await fetch(parsed, { method: "HEAD", redirect: "follow" });
    if (!head.ok) return { ok: false, reason: `fetch_${head.status}` };
    const ct = head.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    if (!ct || !ALLOWED_TYPES.has(ct)) return { ok: false, reason: "bad_content_type" };
    const len = Number(head.headers.get("content-length") ?? 0);
    if (len > MAX_BYTES) return { ok: false, reason: "too_large" };
    return { ok: true };
  } catch (err) {
    logger.warn("Image validation fetch failed", { url: parsed.toString(), err: String(err), ms: Date.now() - start });
    return { ok: false, reason: "fetch_failed" };
  }
}

export async function validateImageUrls(urls: string[]): Promise<{ valid: string[]; invalid: string[] }> {
  const results = await Promise.all(urls.map(async (u) => ({ u, r: await validateImageUrl(u) })));
  return {
    valid: results.filter((x) => x.r.ok).map((x) => x.u),
    invalid: results.filter((x) => !x.r.ok).map((x) => x.u),
  };
}
