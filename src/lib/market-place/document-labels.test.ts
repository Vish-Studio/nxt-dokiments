import { describe, expect, it } from "vitest";

import { documentTypes } from "@/types/template";

import { featuredDocumentTypes, sortDocumentTypes } from "./document-labels";

describe("sortDocumentTypes", () => {
  it("puts the featured types first, in their fixed order", () => {
    const sorted = sortDocumentTypes(documentTypes);

    expect(sorted.slice(0, featuredDocumentTypes.length)).toEqual([
      "invoice",
      "quotation",
      "cv",
      "nda",
      "contract",
      "statement-of-work",
    ]);
  });

  it("orders the remaining types alphabetically by label", () => {
    expect(
      sortDocumentTypes(["receipt", "proposal", "change-order", "invoice"]),
    ).toEqual(["invoice", "change-order", "proposal", "receipt"]);
  });

  it("keeps every input type exactly once and never adds missing ones", () => {
    expect(sortDocumentTypes(["nda", "receipt"])).toEqual(["nda", "receipt"]);
    expect(sortDocumentTypes(documentTypes)).toHaveLength(documentTypes.length);
  });

  it("does not mutate its input", () => {
    const input = ["receipt", "invoice"] as const;

    sortDocumentTypes(input);

    expect(input).toEqual(["receipt", "invoice"]);
  });
});
