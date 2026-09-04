import { describe, it, expect } from "vitest";
import { moderateText } from "../moderation";

describe("moderateText", () => {
  it("passes clean text", () => {
    const r = moderateText("Brand new Samsung refrigerator for sale in Lagos");
    expect(r.clean).toBe(true);
    expect(r.reasons).toHaveLength(0);
    expect(r.sanitized).toBe("Brand new Samsung refrigerator for sale in Lagos");
  });

  it("strips blocked short-link domains", () => {
    const r = moderateText("Check this out https://bit.ly/abc123 free money!");
    expect(r.clean).toBe(false);
    expect(r.reasons).toContain("blocked_links");
    expect(r.linksRemoved).toBe(1);
    expect(r.sanitized).not.toContain("bit.ly");
    expect(r.sanitized).toContain("[link removed]");
  });

  it("allows normal https URLs", () => {
    const r = moderateText("My shop is at https://www.alibaba.com");
    expect(r.reasons).not.toContain("blocked_links");
  });

  it("redacts profanity", () => {
    const r = moderateText("This fuck scammed me");
    expect(r.clean).toBe(false);
    expect(r.reasons).toContain("profanity");
    expect(r.profanityHits).toContain("fuck");
    expect(r.sanitized).toBe("This **** scammed me");
  });

  it("handles multiple profanities", () => {
    const r = moderateText("fuck shit ass shit");
    expect(r.profanityHits).toContain("fuck");
    expect(r.profanityHits).toContain("shit");
    expect(r.sanitized).not.toContain("fuck");
    expect(r.sanitized).not.toContain("shit");
  });
});
