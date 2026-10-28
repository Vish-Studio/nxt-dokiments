import { describe, expect, it } from "vitest";

import { readEmailVerified } from "./id-token";

/** Builds an unsigned JWT-shaped string carrying `claims`. */
const tokenWith = (claims: Record<string, unknown>) =>
  `header.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.signature`;

describe("readEmailVerified", () => {
  it("returns true when the claim is true", () => {
    expect(readEmailVerified(tokenWith({ email_verified: true }))).toBe(true);
  });

  it("returns false when the claim is false", () => {
    expect(readEmailVerified(tokenWith({ email_verified: false }))).toBe(false);
  });

  it("returns false when the claim is missing", () => {
    expect(readEmailVerified(tokenWith({ sub: "uid" }))).toBe(false);
  });

  it("does not accept truthy non-boolean values", () => {
    expect(readEmailVerified(tokenWith({ email_verified: "true" }))).toBe(
      false,
    );
  });

  it("returns false for a token with no payload segment", () => {
    expect(readEmailVerified("not-a-jwt")).toBe(false);
  });

  it("returns false for a payload that is not JSON", () => {
    expect(readEmailVerified("header.%%%.signature")).toBe(false);
  });
});
