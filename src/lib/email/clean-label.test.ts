import { describe, expect, it } from "vitest";

import { cleanEmailLabel, personLabel } from "./clean-label";

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

describe("personLabel", () => {
  it("uses the cleaned display name, capped at 60 characters", () => {
    expect(
      personLabel({ displayName: "Bob\nSmith", email: "bob@example.com" }),
    ).toBe("Bob Smith");
    expect(
      personLabel({ displayName: "x".repeat(80), email: "bob@example.com" }),
    ).toHaveLength(60);
  });

  it("falls back to the email address when there is no usable name", () => {
    expect(personLabel({ displayName: "  ", email: "bob@example.com" })).toBe(
      "bob@example.com",
    );
  });
});
