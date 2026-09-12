import { describe, expect, it } from "vitest";

import { profileFieldLimits } from "@/types/auth";

import { ProfileSchema } from "./profile-schema";

/** A complete, valid body — the shape `ProfileSettings` always submits. */
const validBody = {
  address: "1 Royal Road, Port Louis",
  companyName: "Vish Studio",
  displayName: "Divesh",
  fullName: "Divesh Heeramun",
  phone: "+230 5123 4567",
  tel: "+230 212 0000",
};

/** A string of exactly `length` characters. */
const chars = (length: number) => "a".repeat(length);

describe("ProfileSchema", () => {
  it("accepts a complete body unchanged", () => {
    expect(ProfileSchema.parse(validBody)).toEqual(validBody);
  });

  describe("displayName", () => {
    it("rejects an empty display name", () => {
      expect(
        ProfileSchema.safeParse({ ...validBody, displayName: "" }).success,
      ).toBe(false);
    });

    it("rejects a whitespace-only display name, because trimming runs first", () => {
      expect(
        ProfileSchema.safeParse({ ...validBody, displayName: "   " }).success,
      ).toBe(false);
    });

    it("accepts a single character", () => {
      // Not an oversight: a profile created without a display name is seeded from
      // the email's local part, so `a@example.com` starts with a one-character
      // name. A minimum of two would make that profile unsavable. The two-character
      // rule in ProfileSettings is a client-side nudge, not the boundary.
      expect(
        ProfileSchema.parse({ ...validBody, displayName: "a" }).displayName,
      ).toBe("a");
    });

    it("trims before storing", () => {
      expect(
        ProfileSchema.parse({ ...validBody, displayName: "  Divesh  " })
          .displayName,
      ).toBe("Divesh");
    });

    it("accepts exactly the ceiling", () => {
      const displayName = chars(profileFieldLimits.displayName);

      expect(
        ProfileSchema.parse({ ...validBody, displayName }).displayName,
      ).toHaveLength(profileFieldLimits.displayName);
    });

    it("rejects one character past the ceiling", () => {
      // The boundary that matters beyond tidiness: an unbounded display name is
      // copied onto feedback records whose Firestore rules assert a 200-character
      // ceiling, and those writes are refused rather than merely stored oddly.
      const displayName = chars(profileFieldLimits.displayName + 1);

      expect(
        ProfileSchema.safeParse({ ...validBody, displayName }).success,
      ).toBe(false);
    });

    it("rejects a body with no display name at all", () => {
      // Every other field defaults, so this is the one key that makes an
      // otherwise-empty body invalid rather than a request to clear everything.
      expect(ProfileSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("the optional fields", () => {
    it("defaults every one of them to an empty string when absent", () => {
      // Worth pinning down: `patchProfileFields` writes all six fields on every
      // call, so these defaults are what makes an omitted field *clear* the stored
      // value rather than write `undefined`. Pre-existing behaviour, preserved.
      expect(ProfileSchema.parse({ displayName: "Divesh" })).toEqual({
        address: "",
        companyName: "",
        displayName: "Divesh",
        fullName: "",
        phone: "",
        tel: "",
      });
    });

    it.each([
      ["address", profileFieldLimits.address],
      ["companyName", profileFieldLimits.companyName],
      ["fullName", profileFieldLimits.fullName],
      ["phone", profileFieldLimits.phone],
      ["tel", profileFieldLimits.tel],
    ] as const)(
      "accepts %s at its ceiling and rejects one past it",
      (field, max) => {
        expect(
          ProfileSchema.safeParse({ ...validBody, [field]: chars(max) })
            .success,
        ).toBe(true);
        expect(
          ProfileSchema.safeParse({ ...validBody, [field]: chars(max + 1) })
            .success,
        ).toBe(false);
      },
    );
  });

  it("strips unknown keys, so a caller cannot smuggle a field through", () => {
    // `role` is the one that would matter. Firestore rules already forbid a user
    // changing their own, and `patchProfileFields` only writes known fields — this
    // asserts the request never carries it that far in the first place.
    const parsed = ProfileSchema.parse({ ...validBody, role: "superadmin" });

    expect(parsed).not.toHaveProperty("role");
  });
});
