import { sealData, unsealData } from "iron-session";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.SESSION_SECRET = "a-test-secret-that-is-at-least-32-characters";
});

import { refreshFirebaseSession } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import { sessionOptions } from "@/lib/session";
import type { AuthSession } from "@/types/auth";

import { POST } from "./route";

vi.mock("@/lib/firebase/server-auth", () => ({
  refreshFirebaseSession: vi.fn(),
}));

const unverifiedUser = {
  displayName: "A",
  email: "a@b.test",
  emailVerified: false,
  provider: "password",
  role: "free",
  uid: "uid-1",
} as const;

/** A request carrying a valid sealed session. */
const requestWithSession = async (
  absoluteExpiresAt = Date.now() + 3_600_000,
) => {
  const sealed = await sealData(
    {
      absoluteExpiresAt,
      expiresAt: Date.now() + 3_600_000,
      idToken: "old-token",
      refreshToken: "refresh",
      user: unverifiedUser,
    },
    { password: sessionOptions.password, ttl: 3600 },
  );

  return new Request("http://localhost/api/auth/refresh-verification", {
    headers: { cookie: `${sessionOptions.cookieName}=${sealed}` },
    method: "POST",
  });
};

const refreshedSession = (emailVerified: boolean): AuthSession => ({
  expiresAt: Date.now() + 3_600_000,
  idToken: "new-token",
  refreshToken: "new-refresh",
  user: { ...unverifiedUser, emailVerified },
});

afterEach(() => {
  vi.mocked(refreshFirebaseSession).mockReset();
});

describe("POST /api/auth/refresh-verification", () => {
  it("returns 401 without a session", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/refresh-verification", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(refreshFirebaseSession).not.toHaveBeenCalled();
  });

  it("returns the refreshed user and rewrites the cookie", async () => {
    vi.mocked(refreshFirebaseSession).mockResolvedValue(refreshedSession(true));

    const response = await POST(await requestWithSession());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      user: { ...unverifiedUser, emailVerified: true },
    });
    expect(response.headers.getSetCookie().join(";")).toContain(
      sessionOptions.cookieName,
    );
  });

  it("reports an email that is still unverified as such", async () => {
    vi.mocked(refreshFirebaseSession).mockResolvedValue(
      refreshedSession(false),
    );

    const response = await POST(await requestWithSession());

    expect((await response.json()).user.emailVerified).toBe(false);
  });

  it("keeps the original 1-day deadline rather than extending it", async () => {
    vi.mocked(refreshFirebaseSession).mockResolvedValue(refreshedSession(true));
    const deadline = Date.now() + 1_800_000;

    const response = await POST(await requestWithSession(deadline));

    const cookie = response.headers
      .getSetCookie()
      .find((value) => value.startsWith(`${sessionOptions.cookieName}=`));
    const sealed = cookie?.split(";")[0].split("=").slice(1).join("=") ?? "";
    const stored = await unsealData<{ absoluteExpiresAt: number }>(sealed, {
      password: sessionOptions.password,
    });

    expect(stored.absoluteExpiresAt).toBe(deadline);
  });

  it("returns 401 and clears the session when Firebase rejects the refresh token", async () => {
    vi.mocked(refreshFirebaseSession).mockRejectedValue(new Error("revoked"));

    const response = await POST(await requestWithSession());

    expect(response.status).toBe(401);
    expect(response.headers.getSetCookie().join(";")).toContain("Max-Age=0");
  });

  it("returns 503 and keeps the session when Firebase cannot be reached", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(refreshFirebaseSession).mockRejectedValue(
      new UpstreamUnavailableError("offline"),
    );

    const response = await POST(await requestWithSession());

    expect(response.status).toBe(503);
    expect(response.headers.getSetCookie().join(";")).not.toContain(
      "Max-Age=0",
    );
  });

  it("returns 401 once the 1-day deadline has passed", async () => {
    const response = await POST(await requestWithSession(Date.now() - 1000));

    expect(response.status).toBe(401);
    expect(refreshFirebaseSession).not.toHaveBeenCalled();
  });
});
