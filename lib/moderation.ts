import { logger } from "@/lib/logger";

const BLOCKED_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "goo.gl",
  "t.co",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "adf.ly",
]);

const PROFANITY_LIST = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "pussy",
  "cunt",
  "nigger",
  "faggot",
];

export interface ModerationResult {
  clean: boolean;
  reasons: string[];
  sanitized: string;
  linksRemoved: number;
  profanityHits: string[];
}

export function moderateText(input: string): ModerationResult {
  const reasons: string[] = [];
  let sanitized = input ?? "";
  let linksRemoved = 0;
  const profanityHits: string[] = [];

  const urlPattern = /https?:\/\/[^\s<>"']+/gi;
  sanitized = sanitized.replace(urlPattern, (match) => {
    try {
      const host = new URL(match).hostname.toLowerCase();
      if (BLOCKED_DOMAINS.has(host)) {
        linksRemoved += 1;
        return "[link removed]";
      }
    } catch {
      return match;
    }
    return match;
  });
  if (linksRemoved > 0) reasons.push("blocked_links");

  const lower = sanitized.toLowerCase();
  for (const word of PROFANITY_LIST) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    if (re.test(lower)) {
      profanityHits.push(word);
      sanitized = sanitized.replace(re, (m) => "*".repeat(m.length));
    }
  }
  if (profanityHits.length > 0) reasons.push("profanity");

  return {
    clean: reasons.length === 0,
    reasons,
    sanitized,
    linksRemoved,
    profanityHits,
  };
}

export function logModeration(userId: string | null, route: string, result: ModerationResult): void {
  if (!result.clean) {
    logger.warn("Content moderation flagged input", {
      userId: userId ?? undefined,
      route,
      reasons: result.reasons,
      linksRemoved: result.linksRemoved,
      profanityHits: result.profanityHits,
    });
  }
}
