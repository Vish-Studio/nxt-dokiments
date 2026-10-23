import { describe, expect, it } from "vitest";

import { normaliseEmail } from "./email";
import { canShareWith, SHARE_RECIPIENT_LIMIT } from "./policy";

const base = {
  email: "bob@example.com",
  ownerEmail: "alice@example.com",
  ownerRole: "free",
  sharedWith: [],
} as const;

const capped = { ...SHARE_RECIPIENT_LIMIT, free: 2 };

describe("normaliseEmail", () => {
  it("trims and lower-cases", () => {
    expect(normaliseEmail("  Bob@Example.COM ")).toBe("bob@example.com");
  });
});

describe("canShareWith", () => {
  it("ships with no limit on any plan", () => {
    expect(Object.values(SHARE_RECIPIENT_LIMIT).every((l) => l === null)).toBe(
      true,
    );
  });

  it("allows any number of recipients while uncapped", () => {
    const sharedWith = Array.from({ length: 50 }, (_, i) => `u${i}@x.com`);

    expect(canShareWith({ ...base, sharedWith })).toEqual({
      allowed: true,
      limit: null,
      used: 50,
    });
  });

  it("refuses sharing with yourself, in any casing", () => {
    expect(
      canShareWith({ ...base, email: " Alice@Example.com" }),
    ).toMatchObject({ allowed: false, reason: "SHARE_SELF_NOT_ALLOWED" });
  });

  describe("with a simulated free-plan limit of 2", () => {
    it("allows a new person below the limit", () => {
      expect(
        canShareWith({ ...base, sharedWith: ["a@x.com"] }, capped),
      ).toEqual({ allowed: true, limit: 2, used: 1 });
    });

    it("refuses a third distinct person", () => {
      expect(
        canShareWith({ ...base, sharedWith: ["a@x.com", "b@x.com"] }, capped),
      ).toEqual({
        allowed: false,
        limit: 2,
        reason: "SHARE_LIMIT_REACHED",
        used: 2,
      });
    });

    it("lets you re-share with someone already counted, whatever the casing", () => {
      expect(
        canShareWith(
          {
            ...base,
            email: "A@X.com",
            sharedWith: ["a@x.com", "b@x.com"],
          },
          capped,
        ),
      ).toMatchObject({ allowed: true });
    });

    it("does not count duplicate ledger entries twice", () => {
      expect(
        canShareWith({ ...base, sharedWith: ["a@x.com", "A@x.com"] }, capped),
      ).toMatchObject({ allowed: true, used: 1 });
    });

    it("only applies to the capped plan", () => {
      expect(
        canShareWith(
          { ...base, ownerRole: "silver", sharedWith: ["a@x.com", "b@x.com"] },
          capped,
        ),
      ).toMatchObject({ allowed: true, limit: null });
    });
  });
});
