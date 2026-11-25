import { describe, expect, it } from "vitest";

import {
  generateInviteToken,
  hashInviteToken,
  INVITE_TTL_MS,
  isInviteTokenShape,
} from "@/lib/sharing/invite-token";

describe("invite tokens", () => {
  it("hashes the token it generates", () => {
    const { hash, token } = generateInviteToken();

    expect(hash).toBe(hashInviteToken(token));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(token);
  });

  it("never repeats", () => {
    expect(generateInviteToken().token).not.toBe(generateInviteToken().token);
  });

  it("produces tokens that pass the shape check", () => {
    expect(isInviteTokenShape(generateInviteToken().token)).toBe(true);
  });

  it("rejects values that cannot be a token", () => {
    expect(isInviteTokenShape("")).toBe(false);
    expect(isInviteTokenShape("short")).toBe(false);
    expect(isInviteTokenShape(`${"a".repeat(42)}/`)).toBe(false);
    expect(isInviteTokenShape("a".repeat(44))).toBe(false);
  });

  it("expires after 14 days", () => {
    expect(INVITE_TTL_MS).toBe(14 * 24 * 60 * 60 * 1000);
  });
});
