import { describe, expect, it } from "vitest";

import { parsePushPayload, safeNotificationPath } from "./payload";

describe("safeNotificationPath", () => {
  it("keeps a same-origin path with its query", () => {
    expect(safeNotificationPath("/my-documents?tab=shared")).toBe(
      "/my-documents?tab=shared",
    );
  });

  it.each([
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "javascript:alert(1)",
    "",
    undefined,
    42,
  ])("falls back to the app root for %s", (value) => {
    expect(safeNotificationPath(value)).toBe("/");
  });
});

describe("parsePushPayload", () => {
  it("reads a well-formed payload", () => {
    expect(
      parsePushPayload(
        JSON.stringify({
          body: "Bob signed",
          tag: "signed:1",
          title: "Signed",
          url: "/my-documents",
        }),
      ),
    ).toEqual({
      body: "Bob signed",
      tag: "signed:1",
      title: "Signed",
      url: "/my-documents",
    });
  });

  it("still returns something displayable for missing or malformed data", () => {
    for (const raw of [undefined, "", "not json", "null", "[]"]) {
      const payload = parsePushPayload(raw);
      expect(payload.title).toBe("Dokiments");
      expect(payload.url).toBe("/");
    }
  });

  it("neutralises an off-origin target", () => {
    expect(
      parsePushPayload(JSON.stringify({ title: "x", url: "https://evil.test" }))
        .url,
    ).toBe("/");
  });
});
