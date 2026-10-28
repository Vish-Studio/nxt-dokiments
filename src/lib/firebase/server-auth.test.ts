import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.NEXT_PUBLIC_SITE_URL = "https://app.test";
});

import {
  refreshFirebaseSession,
  updateAccountPassword,
  sendAccountVerificationEmail,
  signInWithFirebase,
} from "./server-auth";
import { FirebaseRateLimitedError } from "./server-identity";

/** An unsigned JWT-shaped string whose payload carries `email_verified`. */
const tokenWith = (verified: boolean) =>
  `h.${Buffer.from(JSON.stringify({ email_verified: verified })).toString("base64url")}.s`;

/** An empty Firestore profile document; every field falls back to a default. */
const emptyProfile = () =>
  new Response(JSON.stringify({ fields: {} }), { status: 200 });

type FetchStub = (url: string | URL, init?: RequestInit) => Promise<Response>;

const stubFetch = (responses: Response[]) => {
  const spy = vi.fn<FetchStub>(async () => {
    const next = responses.shift();
    if (!next) throw new Error("fetch called more times than stubbed");
    return next;
  });
  vi.stubGlobal("fetch", spy);
  return spy;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("emailVerified on the session", () => {
  it("is false at sign-in when the token says the email is unverified", async () => {
    stubFetch([
      Response.json({
        email: "a@b.test",
        expiresIn: "3600",
        idToken: tokenWith(false),
        localId: "uid-1",
        refreshToken: "refresh",
      }),
      emptyProfile(),
    ]);

    const session = await signInWithFirebase({
      email: "a@b.test",
      password: "secret1",
    });

    expect(session.user.emailVerified).toBe(false);
  });

  it("is true at sign-in when the token says the email is verified", async () => {
    stubFetch([
      Response.json({
        email: "a@b.test",
        expiresIn: "3600",
        idToken: tokenWith(true),
        localId: "uid-1",
        refreshToken: "refresh",
      }),
      emptyProfile(),
    ]);

    const session = await signInWithFirebase({
      email: "a@b.test",
      password: "secret1",
    });

    expect(session.user.emailVerified).toBe(true);
  });

  it("picks up a newly verified email when the token is refreshed", async () => {
    stubFetch([
      Response.json({
        expires_in: "3600",
        id_token: tokenWith(true),
        refresh_token: "refresh-2",
        user_id: "uid-1",
      }),
      emptyProfile(),
    ]);

    const refreshed = await refreshFirebaseSession({
      expiresAt: 0,
      idToken: tokenWith(false),
      refreshToken: "refresh",
      user: {
        displayName: "A",
        email: "a@b.test",
        emailVerified: false,
        provider: "password",
        role: "free",
        uid: "uid-1",
      },
    });

    expect(refreshed.user.emailVerified).toBe(true);
  });
});

describe("updateAccountPassword", () => {
  it("re-reads emailVerified from the token Firebase issues", async () => {
    stubFetch([
      Response.json({
        expiresIn: "3600",
        idToken: tokenWith(true),
        refreshToken: "refresh-2",
      }),
    ]);

    const updated = await updateAccountPassword(
      {
        expiresAt: 0,
        idToken: tokenWith(false),
        refreshToken: "refresh",
        user: {
          displayName: "A",
          email: "a@b.test",
          emailVerified: false,
          provider: "password",
          role: "free",
          uid: "uid-1",
        },
      },
      "new-secret1",
    );

    expect(updated.user.emailVerified).toBe(true);
  });
});

describe("sendAccountVerificationEmail", () => {
  it("asks Firebase to verify the token's account and return to the dashboard", async () => {
    const spy = stubFetch([Response.json({ email: "a@b.test" })]);

    await sendAccountVerificationEmail("the-id-token");

    expect(String(spy.mock.calls[0][0])).toContain("accounts:sendOobCode");
    expect(JSON.parse(String(spy.mock.calls[0][1]?.body))).toEqual({
      continueUrl: "https://app.test/dashboard",
      idToken: "the-id-token",
      requestType: "VERIFY_EMAIL",
    });
  });

  it("throws FirebaseRateLimitedError when Firebase is throttling the account", async () => {
    stubFetch([
      Response.json(
        { error: { message: "TOO_MANY_ATTEMPTS_TRY_LATER" } },
        { status: 400 },
      ),
    ]);

    await expect(sendAccountVerificationEmail("t")).rejects.toBeInstanceOf(
      FirebaseRateLimitedError,
    );
  });
});
