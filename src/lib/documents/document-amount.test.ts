import { describe, expect, it } from "vitest";

import { writeLineItems } from "@/lib/market-place/line-items";

import { getDocumentAmount } from "./document-amount";

describe("getDocumentAmount", () => {
  it("prefers the typed total and keeps a typed currency", () => {
    expect(getDocumentAmount({ fee: "500", total: "Rs 10,000" })).toBe("Rs 10,000");
  });

  it("formats plain numbers", () => {
    expect(getDocumentAmount({ total: "1250" })).toBe("1,250.00");
  });

  it("falls back to fees and prices", () => {
    expect(getDocumentAmount({ fee: "$800" })).toBe("$800");
    expect(getDocumentAmount({ price: "99.5" })).toBe("99.50");
  });

  it("works the total out from line items and tax", () => {
    const items = writeLineItems([
      { description: "Design", price: "100", quantity: "2" },
      { description: "Hosting", price: "50", quantity: "1" },
    ]);
    expect(getDocumentAmount({ items, tax: "10%" })).toBe("275.00");
  });

  it("is empty without an amount, or with only zeros", () => {
    expect(getDocumentAmount({ title: "NDA" })).toBe("");
    expect(getDocumentAmount({ total: "$0.00" })).toBe("");
    expect(getDocumentAmount()).toBe("");
  });
});
