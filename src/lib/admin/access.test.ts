import { describe, expect, it } from "vitest";

import { isSuperadmin } from "./access";

describe("isSuperadmin", () => {
  it("lets a superadmin in", () => {
    expect(isSuperadmin({ role: "superadmin" })).toBe(true);
  });

  it("keeps every paying plan out", () => {
    expect(isSuperadmin({ role: "gold" })).toBe(false);
    expect(isSuperadmin({ role: "special" })).toBe(false);
    expect(isSuperadmin({ role: "silver" })).toBe(false);
    expect(isSuperadmin({ role: "free" })).toBe(false);
  });

  it("keeps a signed-out visitor out", () => {
    expect(isSuperadmin(null)).toBe(false);
    expect(isSuperadmin(undefined)).toBe(false);
  });
});
