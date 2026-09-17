import { describe, expect, it } from "vitest";

import { credentialFieldLimits, profileFieldLimits } from "@/types/auth";
import { MAX_PROMO_CODE } from "@/types/promo";

import {
  ForgotPasswordSchema,
  ReauthenticateSchema,
  SignInSchema,
  SignUpSchema,
  UpdatePasswordSchema,
} from "./auth-schema";

/** A string of exactly `length` characters. */
const chars = (length: number) => "a".repeat(length);

/** A syntactically valid email of exactly `length` characters. */
const emailOfLength = (length: number) => {
  const domain = "@example.com";
  return `${chars(length - domain.length)}${domain}`;
};

/** A complete, valid sign-up body — what `SignUpForm` submits. */
const validSignUp = {
  displayName: "Divesh",
  email: "divesh@example.com",
  password: "sup3r-secret",
  promoCode: "",
};

/** A complete, valid sign-in body — what `SignInForm` submits. */
const validSignIn = {
  email: "divesh@example.com",
  password: "sup3r-secret",
  promoCode: "",
};

describe("SignUpSchema", () => {
  it("accepts a complete body unchanged", () => {
    expect(SignUpSchema.parse(validSignUp)).toEqual(validSignUp);
  });

  describe("displayName", () => {
    it("accepts exactly the ceiling", () => {
      const displayName = chars(profileFieldLimits.displayName);

      expect(
        SignUpSchema.parse({ ...validSignUp, displayName }).displayName,
      ).toHaveLength(profileFieldLimits.displayName);
    });

    it("rejects one character past the ceiling", () => {
      // The boundary this whole module was written for: sign-up writes this name to
      // the Firebase Auth account *and* to `users/{uid}`, and it is later copied onto
      // feedback records whose Firestore rules assert a 200-character ceiling. The
      // number matches `ProfileSchema` so both write paths agree.
      const displayName = chars(profileFieldLimits.displayName + 1);

      expect(
        SignUpSchema.safeParse({ ...validSignUp, displayName }).success,
      ).toBe(false);
    });

    it("trims before storing", () => {
      expect(
        SignUpSchema.parse({ ...validSignUp, displayName: "  Divesh  " })
          .displayName,
      ).toBe("Divesh");
    });

    it("rejects a whitespace-only name, because trimming runs first", () => {
      expect(
        SignUpSchema.safeParse({ ...validSignUp, displayName: "   " }).success,
      ).toBe(false);
    });

    it("rejects a body with no name at all", () => {
      // Required, unlike on the underlying `AuthRequest`: `SignUpForm` always collects
      // one, and the accounts that legitimately arrive without a name are the Google
      // ones, which never reach this route.
      expect(
        SignUpSchema.safeParse({
          email: validSignUp.email,
          password: validSignUp.password,
        }).success,
      ).toBe(false);
    });
  });

  describe("password", () => {
    it("accepts exactly the ceiling", () => {
      const password = chars(credentialFieldLimits.password);

      expect(
        SignUpSchema.parse({ ...validSignUp, password }).password,
      ).toHaveLength(credentialFieldLimits.password);
    });

    it("rejects one character past the ceiling", () => {
      const password = chars(credentialFieldLimits.password + 1);

      expect(SignUpSchema.safeParse({ ...validSignUp, password }).success).toBe(
        false,
      );
    });

    it("accepts a password shorter than Firebase's six-character minimum", () => {
      // Not an oversight. Firebase answers a short password with `WEAK_PASSWORD`,
      // which `mapFirebaseError` turns into "Use a stronger password with at least 6
      // characters." and the route returns verbatim. A schema minimum would replace
      // that with "Invalid request body." and tell the user nothing.
      expect(
        SignUpSchema.safeParse({ ...validSignUp, password: "abc" }).success,
      ).toBe(true);
    });

    it("rejects an empty password", () => {
      expect(
        SignUpSchema.safeParse({ ...validSignUp, password: "" }).success,
      ).toBe(false);
    });

    it("does not trim, since a password's whitespace is part of it", () => {
      expect(
        SignUpSchema.parse({ ...validSignUp, password: "  spaced  " }).password,
      ).toBe("  spaced  ");
    });
  });
});

describe("the email field", () => {
  // One shared suite: sign-up, sign-in and forgot-password use the same field, and a
  // ceiling enforced on two routes out of three would be no ceiling at all.
  const cases = [
    [
      "SignUpSchema",
      (email: unknown) => SignUpSchema.safeParse({ ...validSignUp, email }),
    ],
    [
      "SignInSchema",
      (email: unknown) => SignInSchema.safeParse({ ...validSignIn, email }),
    ],
    [
      "ForgotPasswordSchema",
      (email: unknown) => ForgotPasswordSchema.safeParse({ email }),
    ],
  ] as const;

  it.each(cases)(
    "%s accepts an address at exactly the RFC 5321 limit",
    (_name, parse) => {
      expect(parse(emailOfLength(credentialFieldLimits.email)).success).toBe(
        true,
      );
    },
  );

  it.each(cases)("%s rejects one character past it", (_name, parse) => {
    expect(parse(emailOfLength(credentialFieldLimits.email + 1)).success).toBe(
      false,
    );
  });

  it.each(cases)("%s rejects a malformed address", (_name, parse) => {
    expect(parse("not-an-email").success).toBe(false);
  });

  it.each(cases)("%s rejects a non-string", (_name, parse) => {
    // The guard that matters most: without it this value was interpolated into a
    // Firebase REST body as-is.
    expect(parse({ toString: "nope" }).success).toBe(false);
  });

  it.each(cases)("%s trims before checking the format", (_name, parse) => {
    const result = parse("  divesh@example.com  ");

    expect(result.success && result.data.email).toBe("divesh@example.com");
  });
});

describe("SignInSchema", () => {
  it("accepts a complete body unchanged", () => {
    expect(SignInSchema.parse(validSignIn)).toEqual(validSignIn);
  });

  it("accepts a password far past the ceiling used when one is being set", () => {
    // Load-bearing. `credentialFieldLimits.password` postdates every account it
    // would judge, so bounding a password here would permanently lock out anyone
    // whose stored password is longer than the limit we picked. Only the *set*
    // paths — sign-up and update-password — get a maximum.
    const password = chars(credentialFieldLimits.password * 4);

    expect(SignInSchema.safeParse({ ...validSignIn, password }).success).toBe(
      true,
    );
  });

  it("rejects an empty password", () => {
    expect(
      SignInSchema.safeParse({ ...validSignIn, password: "" }).success,
    ).toBe(false);
  });
});

describe("the promo code on the authenticating routes", () => {
  const cases = [
    [
      "SignUpSchema",
      (promoCode: unknown) =>
        SignUpSchema.safeParse({ ...validSignUp, promoCode }),
    ],
    [
      "SignInSchema",
      (promoCode: unknown) =>
        SignInSchema.safeParse({ ...validSignIn, promoCode }),
    ],
  ] as const;

  it.each(cases)(
    "%s accepts an empty code, which is what an untouched form sends",
    (_name, parse) => {
      // Both forms submit the field whether or not the user has a code, so this is
      // the ordinary case, not an edge one — `RedeemPromoSchema`'s `min(1)` must not
      // leak into these two schemas.
      expect(parse("").success).toBe(true);
    },
  );

  it.each(cases)("%s accepts an absent code", (_name, parse) => {
    expect(parse(undefined).success).toBe(true);
  });

  it.each(cases)(
    "%s leaves whitespace intact rather than trimming it",
    (_name, parse) => {
      // `normalizePromoCode` is the one place promo input is normalised; a trim here
      // would quietly become a second.
      const result = parse("  vishdok2026!  ");

      expect(result.success && result.data.promoCode).toBe("  vishdok2026!  ");
    },
  );

  it.each(cases)("%s accepts a code at exactly the ceiling", (_name, parse) => {
    expect(parse(chars(MAX_PROMO_CODE)).success).toBe(true);
  });

  it.each(cases)(
    "%s rejects the whole body one character past it",
    (_name, parse) => {
      // The documented consequence: an oversized code fails the *body*, so the
      // authentication never happens. Unreachable from the forms, which cap the
      // input at the same number.
      expect(parse(chars(MAX_PROMO_CODE + 1)).success).toBe(false);
    },
  );
});

describe("UpdatePasswordSchema", () => {
  it("accepts a new password at exactly the ceiling", () => {
    expect(
      UpdatePasswordSchema.parse({
        password: chars(credentialFieldLimits.password),
      }).password,
    ).toHaveLength(credentialFieldLimits.password);
  });

  it("rejects one character past the ceiling", () => {
    expect(
      UpdatePasswordSchema.safeParse({
        password: chars(credentialFieldLimits.password + 1),
      }).success,
    ).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(UpdatePasswordSchema.safeParse({ password: "" }).success).toBe(false);
  });

  it("rejects a non-string password", () => {
    // This value was previously cast straight into the Firebase `accounts:update`
    // request body.
    expect(UpdatePasswordSchema.safeParse({ password: 12345678 }).success).toBe(
      false,
    );
  });
});

describe("ReauthenticateSchema", () => {
  it("accepts a password past the set-a-password ceiling", () => {
    // Same reason as sign-in: this verifies an existing credential. Refusing a long
    // one would leave its owner unable to reach the very screen that would shorten it.
    const password = chars(credentialFieldLimits.password * 4);

    expect(ReauthenticateSchema.safeParse({ password }).success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(ReauthenticateSchema.safeParse({ password: "" }).success).toBe(false);
  });

  it("strips an email, which this route always takes from the session", () => {
    const parsed = ReauthenticateSchema.parse({
      email: "someone.else@example.com",
      password: "sup3r-secret",
    });

    expect(parsed).not.toHaveProperty("email");
  });
});

describe("ForgotPasswordSchema", () => {
  it("accepts a lone email", () => {
    expect(ForgotPasswordSchema.parse({ email: "divesh@example.com" })).toEqual({
      email: "divesh@example.com",
    });
  });

  it("rejects an empty body", () => {
    expect(ForgotPasswordSchema.safeParse({}).success).toBe(false);
  });
});
