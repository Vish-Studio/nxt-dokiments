import { describe, expect, it } from "vitest";

import { isSignableDocument, isViewOnlyShare } from "./signable";

const withFields = (...keys: string[]) => ({
  fields: keys.map((key) => ({ key, label: key, type: "text" as const })),
});

describe("isSignableDocument", () => {
  it("is true only when the layout has a recipient signature", () => {
    expect(isSignableDocument(withFields("title", "recipientSignature"))).toBe(
      true,
    );
    expect(isSignableDocument(withFields("title", "senderSignature"))).toBe(
      false,
    );
    expect(isSignableDocument(undefined)).toBe(false);
  });
});

describe("isViewOnlyShare", () => {
  it("is true for a known layout with no recipient signature", () => {
    expect(isViewOnlyShare({ templateSnapshot: withFields("title") })).toBe(
      true,
    );
  });

  it("is false for a signable layout or a missing one", () => {
    expect(
      isViewOnlyShare({
        templateSnapshot: withFields("recipientSignature"),
      }),
    ).toBe(false);
    expect(isViewOnlyShare({})).toBe(false);
  });
});
