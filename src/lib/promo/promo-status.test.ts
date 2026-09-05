import { describe, expect, it } from "vitest";

import {
  isPromoStatus,
  promoStatusFeedback,
  withPromoStatus,
} from "./promo-status";

describe("isPromoStatus", () => {
  it("accepts every real status", () => {
    expect(isPromoStatus("applied")).toBe(true);
    expect(isPromoStatus("already_redeemed")).toBe(true);
    expect(isPromoStatus("invalid")).toBe(true);
    expect(isPromoStatus("failed")).toBe(true);
  });

  it("rejects anything else, since the value comes from a user-editable URL", () => {
    expect(isPromoStatus("bogus")).toBe(false);
    expect(isPromoStatus("APPLIED")).toBe(false);
    expect(isPromoStatus("")).toBe(false);
    expect(isPromoStatus(null)).toBe(false);
    expect(isPromoStatus(undefined)).toBe(false);
  });
});

describe("withPromoStatus", () => {
  it("adds the status to a plain path", () => {
    expect(withPromoStatus("/dashboard", "applied")).toBe(
      "/dashboard?promo=applied",
    );
  });

  it("merges into a destination that already has a query string", () => {
    expect(
      withPromoStatus("/documents?templateId=classic-invoice", "invalid"),
    ).toBe("/documents?templateId=classic-invoice&promo=invalid");
  });

  it("preserves a hash", () => {
    expect(withPromoStatus("/settings#profile", "already_redeemed")).toBe(
      "/settings?promo=already_redeemed#profile",
    );
  });

  it("replaces a promo param already present rather than duplicating it", () => {
    expect(withPromoStatus("/dashboard?promo=invalid", "applied")).toBe(
      "/dashboard?promo=applied",
    );
  });

  it("returns the destination untouched when there is no outcome to report", () => {
    expect(withPromoStatus("/dashboard")).toBe("/dashboard");
    expect(withPromoStatus("/dashboard", null)).toBe("/dashboard");
  });

  it("never returns an absolute URL, so it cannot become an off-site redirect", () => {
    expect(withPromoStatus("https://evil.example/steal", "applied")).toBe(
      "/steal?promo=applied",
    );
    expect(withPromoStatus("//evil.example/steal", "applied")).toBe(
      "/steal?promo=applied",
    );
  });
});

describe("promoStatusFeedback", () => {
  it("presents a successful redemption as good news", () => {
    expect(promoStatusFeedback("applied")).toEqual({
      message: "Launch promo applied.",
      tone: "success",
    });
  });

  it("uses the agreed wording for a repeat redemption", () => {
    expect(promoStatusFeedback("already_redeemed")).toEqual({
      message: "This promo code has already been used for your account.",
      tone: "error",
    });
  });

  it("uses the agreed wording for an unrecognised code", () => {
    expect(promoStatusFeedback("invalid")).toEqual({
      message: "Invalid promo code.",
      tone: "error",
    });
  });

  it("tells a user whose code could not be processed where to retry", () => {
    expect(promoStatusFeedback("failed")).toEqual({
      message:
        "We couldn't apply your promo code. Please try again from Settings.",
      tone: "error",
    });
  });
});
