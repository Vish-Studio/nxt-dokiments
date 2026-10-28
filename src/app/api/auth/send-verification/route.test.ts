import { sealData } from "iron-session";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.NEXT_PUBLIC_SITE_URL = "https://app.test";
  process.env.SESSION_SECRET = "a-test-secret-that-is-at-least-32-characters";
});

import { sessionOptions } from "@/lib/session";

import { POST } from "./route";

const tokenWith = (verified: boolean) =>
  `h.${Buffer.from(JSON.stringify({ email_verified: verified })).toString("base64url")}.s`;

/** A request carrying a valid sealed session whose token has the given claim. */
const requestFor = async (verified: boolean) => {
  const sealed = await sealData(
    {
      absoluteExpiresAt: Date.now() + 3_600_000,
      expiresAt: Date.now() + 3_600_000,
      idToken: tokenWith(verified),
      refreshToken: "refresh",
      user: {
        displayName: "A",
        email: "a@b.test",
        provider: "password",
        role: "free",
        uid: "uid-1",
      },
    },
    { password: sessionOptions.password, ttl: 3600 },
  );

  return new Request("http://localhost/api/auth/send-verification", {
    headers: { cookie: `${sessionOptions.cookieName}=${sealed}` },
    method: "POST",
  });
};

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
  vi.restoreAllMocks();
});

describe("POST /api/auth/send-verification", () => {
  it("returns 401 without a session", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/send-verification", {
        method: "POST",
      }),
      undefined,
    );

    expect(response.status).toBe(401);
  });

  it("sends the verification email and returns 204", async () => {
    const spy = stubFetch([Response.json({ email: "a@b.test" })]);

    const response = await POST(await requestFor(false), undefined);

    expect(response.status).toBe(204);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(spy.mock.calls[0][1]?.body))).toMatchObject({
      requestType: "VERIFY_EMAIL",
    });
  });

  it("returns 204 without contacting Firebase when the email is already verified", async () => {
    const spy = stubFetch([]);

    const response = await POST(await requestFor(true), undefined);

    expect(response.status).toBe(204);
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns 429 when Firebase is throttling the account", async () => {
    stubFetch([
      Response.json(
        { error: { message: "TOO_MANY_ATTEMPTS_TRY_LATER" } },
        { status: 400 },
      ),
    ]);

    const response = await POST(await requestFor(false), undefined);

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error: "Too many attempts. Please try again later.",
    });
  });

  it("returns 400 with Firebase's mapped message for any other rejection", async () => {
    stubFetch([
      Response.json(
        { error: { message: "INVALID_ID_TOKEN" } },
        { status: 400 },
      ),
    ]);

    const response = await POST(await requestFor(false), undefined);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Your session is no longer valid. Please sign in again.",
    });
  });
});
