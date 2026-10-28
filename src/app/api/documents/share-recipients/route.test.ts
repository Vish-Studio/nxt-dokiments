import { sealData } from "iron-session";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const flag = vi.hoisted(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.SESSION_SECRET = "a-test-secret-that-is-at-least-32-characters";
  return { enabled: true };
});

vi.mock("@/lib/sharing/feature-flag", () => ({
  get documentSharingEnabled() {
    return flag.enabled;
  },
}));

import { sessionOptions } from "@/lib/session";

import { GET } from "./route";

const entry = (email: string, lastSharedAt: string) => ({
  fields: {
    email: { stringValue: email },
    firstSharedAt: { timestampValue: "2026-10-01T00:00:00.000Z" },
    lastSharedAt: { timestampValue: lastSharedAt },
  },
  name: `projects/p/databases/(default)/documents/users/alice-uid/shareRecipients/${email}`,
});

const request = async (signedIn = true) => {
  const sealed = await sealData(
    {
      absoluteExpiresAt: Date.now() + 3_600_000,
      expiresAt: Date.now() + 3_600_000,
      idToken: "h.e30.s",
      refreshToken: "refresh",
      user: {
        displayName: "Alice",
        email: "alice@example.com",
        emailVerified: true,
        provider: "password",
        role: "free",
        uid: "alice-uid",
      },
    },
    { password: sessionOptions.password, ttl: 3600 },
  );

  return new Request("http://localhost/api/documents/share-recipients", {
    headers: signedIn
      ? { cookie: `${sessionOptions.cookieName}=${sealed}` }
      : {},
  });
};

beforeEach(() => {
  flag.enabled = true;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/documents/share-recipients", () => {
  it("returns the ledger newest first", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              documents: [
                entry("old@example.com", "2026-10-02T00:00:00.000Z"),
                entry("new@example.com", "2026-10-05T00:00:00.000Z"),
              ],
            }),
          ),
      ),
    );

    const response = await GET(await request(), undefined);
    const { recipients } = await response.json();

    expect(response.status).toBe(200);
    expect(recipients.map((r: { email: string }) => r.email)).toEqual([
      "new@example.com",
      "old@example.com",
    ]);
    expect(recipients[0].lastSharedAt).toBe(
      Date.parse("2026-10-05T00:00:00.000Z"),
    );
  });

  it("returns an empty list when nothing has been shared yet", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}")),
    );

    const response = await GET(await request(), undefined);

    expect((await response.json()).recipients).toEqual([]);
  });

  it("answers 401 without a session", async () => {
    const response = await GET(await request(false), undefined);

    expect(response.status).toBe(401);
  });

  it("answers 404 while the flag is off", async () => {
    flag.enabled = false;

    const response = await GET(await request(), undefined);

    expect(response.status).toBe(404);
  });
});
