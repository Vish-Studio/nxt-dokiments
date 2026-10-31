import { describe, expect, it } from "vitest";

import { withNext } from "./auth-link";

describe("withNext", () => {
  it("keeps a same-origin destination, with its query encoded", () => {
    expect(withNext("/sign-up", "/my-documents?tab=shared")).toBe(
      "/sign-up?next=%2Fmy-documents%3Ftab%3Dshared",
    );
  });

  it.each([undefined, null, "", "https://evil.com", "//evil.com", "docs"])(
    "returns the bare path for %s",
    (next) => {
      expect(withNext("/sign-in", next)).toBe("/sign-in");
    },
  );
});
