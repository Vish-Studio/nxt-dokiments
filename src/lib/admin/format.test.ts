import { describe, expect, it } from "vitest";

import { formatChange, formatCount, formatDate, formatShare, pluralise } from "./format";

describe("formatDate", () => {
  it("reads dd/mm/yy", () => {
    expect(formatDate(Date.UTC(2026, 10, 28, 12))).toBe("28/11/26");
  });

  it("shows a dash for an unknown date", () => {
    expect(formatDate(null)).toBe("—");
  });
});

describe("formatShare", () => {
  it("rounds to one decimal", () => {
    expect(formatShare(812, 12_480)).toBe("6.5%");
  });

  it("does not divide by zero", () => {
    expect(formatShare(0, 0)).toBe("0%");
  });
});

describe("formatChange", () => {
  it("signs growth and decline", () => {
    expect(formatChange(0.041)).toBe("+4.1%");
    expect(formatChange(-0.05)).toBe("−5%");
  });
});

describe("pluralise", () => {
  it("uses the singular for one", () => {
    expect(pluralise(1, "account")).toBe("1 account");
  });

  it("formats and pluralises larger counts", () => {
    expect(pluralise(12_480, "account")).toBe("12,480 accounts");
  });
});

describe("formatCount", () => {
  it("groups thousands", () => {
    expect(formatCount(1_000_000)).toBe("1,000,000");
  });
});
