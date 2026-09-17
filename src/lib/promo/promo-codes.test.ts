import { describe, expect, it } from "vitest";

import {
  activePromoCode,
  findPromoCode,
  normalizePromoCode,
  promoCodes,
} from "./promo-codes";

describe("normalizePromoCode", () => {
  it("upper-cases so a code retyped in any casing still matches", () => {
    expect(normalizePromoCode("vishdok2026!")).toBe("VISHDOK2026!");
    expect(normalizePromoCode("ViSHDOK2026!")).toBe("VISHDOK2026!");
    expect(normalizePromoCode("VISHDOK2026!")).toBe("VISHDOK2026!");
  });

  it("strips surrounding whitespace", () => {
    expect(normalizePromoCode("  ViSHDOK2026!  ")).toBe("VISHDOK2026!");
  });

  it("strips whitespace inside the code, not just at the ends", () => {
    expect(normalizePromoCode("ViSH DOK 2026!")).toBe("VISHDOK2026!");
  });

  it("strips tabs and newlines, as a code pasted from a wrapped email carries", () => {
    expect(normalizePromoCode("\tViSHDOK\n2026! \r\n")).toBe("VISHDOK2026!");
  });

  it("reduces whitespace-only input to the empty string", () => {
    expect(normalizePromoCode("   ")).toBe("");
    expect(normalizePromoCode("")).toBe("");
  });

  it("leaves punctuation alone — the trailing '!' is part of the code", () => {
    expect(normalizePromoCode("vishdok2026")).toBe("VISHDOK2026");
  });
});

describe("findPromoCode", () => {
  it("matches the active code exactly as advertised", () => {
    expect(findPromoCode(activePromoCode.code)).toEqual(activePromoCode);
  });

  it("matches regardless of casing", () => {
    expect(findPromoCode("vishdok2026!")).toEqual(activePromoCode);
    expect(findPromoCode("VISHDOK2026!")).toEqual(activePromoCode);
    expect(findPromoCode("vIshDoK2026!")).toEqual(activePromoCode);
  });

  it("matches despite surrounding or internal whitespace", () => {
    expect(findPromoCode("  ViSHDOK2026!  ")).toEqual(activePromoCode);
    expect(findPromoCode("ViSHDOK 2026!")).toEqual(activePromoCode);
  });

  it("returns the registry entry, so callers store the canonical code rather than the typed one", () => {
    expect(findPromoCode("  vishdok2026!  ")?.code).toBe("ViSHDOK2026!");
  });

  it("rejects a near miss — a dropped character is not the code", () => {
    expect(findPromoCode("ViSHDOK2026")).toBeUndefined();
    expect(findPromoCode("ViSHDOK2025!")).toBeUndefined();
  });

  it("rejects an unrelated code", () => {
    expect(findPromoCode("NOTAPROMO")).toBeUndefined();
  });

  it("rejects empty and whitespace-only input rather than matching a blank code", () => {
    expect(findPromoCode("")).toBeUndefined();
    expect(findPromoCode("   ")).toBeUndefined();
  });
});

describe("promoCodes registry", () => {
  it("declares an active code", () => {
    expect(activePromoCode).toBeDefined();
    expect(activePromoCode.code).toBe("ViSHDOK2026!");
  });

  it("uses ids that are safe as Firestore document IDs", () => {
    for (const promo of promoCodes) {
      expect(promo.id).toMatch(/^[a-z0-9][a-z0-9-]*$/);
    }
  });

  it("has no two entries that normalise to the same code", () => {
    const normalized = promoCodes.map((promo) =>
      normalizePromoCode(promo.code),
    );
    expect(new Set(normalized).size).toBe(promoCodes.length);
  });

  it("has no duplicate ids, since the id is a redemption's document ID", () => {
    const ids = promoCodes.map((promo) => promo.id);
    expect(new Set(ids).size).toBe(promoCodes.length);
  });
});
