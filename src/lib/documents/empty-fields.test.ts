import { describe, expect, it } from "vitest";

import type { TemplateField } from "@/types/template";

import { getEmptyDocumentFields, isBlankFieldValue } from "./empty-fields";

const field = (key: string, label = key): TemplateField => ({
  key,
  label,
  type: "text",
});

describe("isBlankFieldValue", () => {
  it("treats missing and whitespace-only values as blank", () => {
    expect(isBlankFieldValue(undefined)).toBe(true);
    expect(isBlankFieldValue("")).toBe(true);
    expect(isBlankFieldValue("   \n ")).toBe(true);
  });

  it("treats a line-items table with only blank rows as blank", () => {
    expect(
      isBlankFieldValue(
        'dokiments-items-v1:[{"description":" ","quantity":"","price":""}]',
      ),
    ).toBe(true);
    expect(isBlankFieldValue("dokiments-items-v1:[]")).toBe(true);
  });

  it("treats any real text or filled row as filled", () => {
    expect(isBlankFieldValue("Port Louis")).toBe(false);
    expect(
      isBlankFieldValue(
        'dokiments-items-v1:[{"description":"Design","quantity":"1","price":"500"}]',
      ),
    ).toBe(false);
  });
});

describe("getEmptyDocumentFields", () => {
  const fields = [
    field("title"),
    field("toName", "Client name"),
    field("toAddress", "Client address"),
    field("toEmail"),
    field("toBrn"),
    field("reference", "Agreement reference"),
    field("recipientSignature"),
  ];

  it("returns the empty required fields in template order", () => {
    expect(
      getEmptyDocumentFields(fields, { toName: "Lumina Events" }).map(
        (empty) => empty.label,
      ),
    ).toEqual(["Client address", "Agreement reference"]);
  });

  it("never returns optional fields", () => {
    const keys = getEmptyDocumentFields(fields, {}).map((empty) => empty.key);

    expect(keys).not.toContain("title");
    expect(keys).not.toContain("toEmail");
    expect(keys).not.toContain("toBrn");
    expect(keys).not.toContain("recipientSignature");
  });

  it("returns nothing when every required field is filled", () => {
    expect(
      getEmptyDocumentFields(fields, {
        reference: "AGR-12",
        toAddress: "Port Louis",
        toName: "Lumina Events",
      }),
    ).toEqual([]);
  });
});
