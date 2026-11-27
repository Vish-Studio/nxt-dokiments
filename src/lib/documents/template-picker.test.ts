import { describe, expect, it } from "vitest";

import type { MarketplaceTemplate } from "@/types/template";

import {
  buildTemplatePickerGroups,
  formatTemplateLastUsed,
  getTemplateLastUsed,
} from "./template-picker";

const day = 24 * 60 * 60 * 1000;

const template = (
  id: string,
  documentType: MarketplaceTemplate["documentType"],
  styleName: string,
): MarketplaceTemplate => ({
  description: "",
  documentType,
  fields: [],
  id,
  name: id,
  style: {
    description: "",
    id: "modern",
    name: styleName,
    tier: "free",
  },
  tier: "free",
});

const templates = [
  template("nda-classic", "nda", "Classic"),
  template("invoice-modern", "invoice", "Modern"),
  template("invoice-classic", "invoice", "Classic"),
  template("quotation-modern", "quotation", "Modern"),
];

describe("getTemplateLastUsed", () => {
  it("keeps the newest document per template", () => {
    expect(
      getTemplateLastUsed([
        { createdAt: 10, templateId: "a" },
        { createdAt: 30, templateId: "a" },
        { createdAt: 20, templateId: "b" },
      ]),
    ).toEqual({ a: 30, b: 20 });
  });

  it("returns an empty map with no documents", () => {
    expect(getTemplateLastUsed([])).toEqual({});
  });
});

describe("buildTemplatePickerGroups", () => {
  it("groups by type in the featured order", () => {
    const groups = buildTemplatePickerGroups(templates, {
      documentType: "all",
      search: "",
    });

    expect(groups.map((group) => group.documentType)).toEqual([
      "invoice",
      "quotation",
      "nda",
    ]);
  });

  it("puts the most recently used template first in its group", () => {
    const [invoices] = buildTemplatePickerGroups(
      templates,
      { documentType: "all", search: "" },
      { "invoice-modern": 5, "invoice-classic": 9 },
    );

    expect(invoices.templates.map((item) => item.id)).toEqual([
      "invoice-classic",
      "invoice-modern",
    ]);
  });

  it("filters by type and search, dropping empty groups", () => {
    expect(
      buildTemplatePickerGroups(templates, {
        documentType: "invoice",
        search: "",
      }).map((group) => group.documentType),
    ).toEqual(["invoice"]);

    const groups = buildTemplatePickerGroups(templates, {
      documentType: "all",
      search: "  CLASSIC ",
    });

    expect(groups.flatMap((group) => group.templates.map((t) => t.id))).toEqual(
      ["invoice-classic", "nda-classic"],
    );
  });

  it("returns no groups when nothing matches", () => {
    expect(
      buildTemplatePickerGroups(templates, {
        documentType: "all",
        search: "receipt brutalist",
      }),
    ).toEqual([]);
  });
});

describe("formatTemplateLastUsed", () => {
  const now = 1_000 * day;

  it("reads not used yet without a date", () => {
    expect(formatTemplateLastUsed(undefined, now)).toBe("not used yet");
  });

  it("reads today under a day", () => {
    expect(formatTemplateLastUsed(now - 1000, now)).toBe("used today");
  });

  it("rounds down to the largest unit", () => {
    expect(formatTemplateLastUsed(now - 2 * day, now)).toBe("used 2 days ago");
    expect(formatTemplateLastUsed(now - day, now)).toBe("used yesterday");
    expect(formatTemplateLastUsed(now - 9 * day, now)).toBe("used last week");
    expect(formatTemplateLastUsed(now - 70 * day, now)).toBe(
      "used 2 months ago",
    );
  });
});
