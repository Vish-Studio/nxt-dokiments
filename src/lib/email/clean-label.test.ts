import { describe, expect, it } from "vitest";

import { cleanEmailLabel } from "./clean-label";

describe("cleanEmailLabel", () => {
  it("keeps a normal name unchanged", () => {
    expect(cleanEmailLabel("Service agreement")).toBe("Service agreement");
  });

  it("turns line breaks and control characters into single spaces", () => {
    expect(cleanEmailLabel("NDA\r\nBcc: x@evil.com\t!")).toBe(
      "NDA Bcc: x@evil.com !",
    );
  });

  it("truncates long names with an ellipsis", () => {
    const result = cleanEmailLabel("a".repeat(200), 10);

    expect(result).toHaveLength(10);
    expect(result.endsWith("…")).toBe(true);
  });

  it("falls back when nothing is left", () => {
    expect(cleanEmailLabel(" \n ")).toBe("a document");
    expect(cleanEmailLabel("", 80, "Someone")).toBe("Someone");
  });
});
