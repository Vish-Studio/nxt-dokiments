import { sealData } from "iron-session";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.SESSION_SECRET = "a-test-secret-that-is-at-least-32-characters";
  return {
    accept: vi.fn(),
    enabled: true,
    lookup: vi.fn(),
  };
});

vi.mock("@/lib/sharing/feature-flag", () => ({
  get documentSharingEnabled() {
    return state.enabled;
  },
}));

vi.mock("@/lib/firebase/server-shared-invites", () => ({
  acceptInvite: state.accept,
  getInviteByToken: state.lookup,
}));

import { sessionOptions } from "@/lib/session";

import { POST } from "./accept/route";
import { GET } from "./route";

const context = { params: Promise.resolve({ token: "tok" }) };

const sessionCookie = async () => {
  const sealed = await sealData(
    {
      absoluteExpiresAt: Date.now() + 3_600_000,
      expiresAt: Date.now() + 3_600_000,
      idToken: "h.e30.s",
      refreshToken: "refresh",
      user: {
        displayName: "Bob",
        email: "bob@example.com",
        emailVerified: false,
        provider: "password",
        role: "free",
        uid: "bob-uid",
      },
    },
    { password: sessionOptions.password, ttl: 3600 },
  );
  return `${sessionOptions.cookieName}=${sealed}`;
};

beforeEach(() => {
  state.enabled = true;
  state.accept.mockReset();
  state.lookup.mockReset();
});

describe("GET /api/shared-invites/:token", () => {
  it("returns only the safe preview, uncached", async () => {
    state.lookup.mockResolvedValue({
      invite: {
        email: "bob@example.com",
        name: "NDA",
        ownerEmail: "alice@example.com",
        ownerId: "owner-uid",
        ownerName: "Alice",
        sharedDocumentId: "s1",
        values: { party: "Acme" },
      },
      state: "valid",
    });

    const response = await GET(new Request("http://localhost/x"), context);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.state).toBe("valid");
    expect(body.invite).toEqual({
      name: "NDA",
      ownerEmail: "alice@example.com",
      ownerName: "Alice",
    });
  });

  it.each(["expired", "invalid"])("reports a %s link", async (value) => {
    state.lookup.mockResolvedValue({ state: value });

    const response = await GET(new Request("http://localhost/x"), context);

    expect(await response.json()).toEqual({ state: value });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("answers 404 while sharing is off", async () => {
    state.enabled = false;

    const response = await GET(new Request("http://localhost/x"), context);

    expect(response.status).toBe(404);
    expect(state.lookup).not.toHaveBeenCalled();
  });
});

describe("POST /api/shared-invites/:token/accept", () => {
  const post = async (signedIn = true) =>
    POST(
      new Request("http://localhost/x", {
        headers: signedIn ? { cookie: await sessionCookie() } : {},
        method: "POST",
      }),
      context,
    );

  it("returns the linked document", async () => {
    state.accept.mockResolvedValue({
      sharedDocumentId: "s1",
      status: "linked",
    });

    const response = await post();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sharedDocumentId: "s1" });
  });

  it("answers 403 with a masked address on a mismatch", async () => {
    state.accept.mockResolvedValue({
      invitedEmail: "a***@example.com",
      status: "mismatch",
    });

    const response = await post();

    expect(response.status).toBe(403);
    expect((await response.json()).invitedEmail).toBe("a***@example.com");
  });

  it("answers 410 for an expired link", async () => {
    state.accept.mockResolvedValue({ status: "expired" });

    expect((await post()).status).toBe(410);
  });

  it("answers 404 for an invalid link", async () => {
    state.accept.mockResolvedValue({ status: "invalid" });

    expect((await post()).status).toBe(404);
  });

  it("answers 401 without a session", async () => {
    expect((await post(false)).status).toBe(401);
    expect(state.accept).not.toHaveBeenCalled();
  });

  it("answers 404 while sharing is off", async () => {
    state.enabled = false;

    expect((await post()).status).toBe(404);
    expect(state.accept).not.toHaveBeenCalled();
  });
});
