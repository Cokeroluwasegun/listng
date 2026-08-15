import { describe, it, expect } from "vitest";
import { newRequestId } from "../logger";

describe("logger", () => {
  it("generates a valid UUID", () => {
    const id = newRequestId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => newRequestId()));
    expect(ids.size).toBe(100);
  });
});
