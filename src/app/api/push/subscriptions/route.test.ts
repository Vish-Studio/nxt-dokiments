import { sealData } from "iron-session";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.SESSION_SECRET = "a-test-secret-that-is-at-least-32-characters";
  return {
    enabled: true,
    remove: vi.fn(),
    save: vi.fn(),
  };
});

vi.mock("@/lib/push/feature-flag", () => ({
  get pushNotificationsEnabled() {
    return mocks.enabled;
  },
}));

vi.mock("@/lib/firebase/server-push-subscriptions", () => ({
  deletePushSubscription: mocks.remove,
  savePushSubscription: mocks.save,
}));

import { sessionOptions } from "@/lib/session";

import { DELETE, POST } from "./route";

const endpoint = "https://fcm.googleapis.com/fcm/send/abc";
const subscription = {
  deviceLabel: "Chrome on macOS",
  endpoint,
  keys: { auth: "auth", p256dh: "key" },
};

const sessionCookie = async () => {
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
  return `${sessionOptions.cookieName}=${sealed}`;
};

const request = async (method: string, body: unknown, signedIn = true) =>
  new Request("http://localhost/api/push/subscriptions", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(signedIn ? { cookie: await sessionCookie() } : {}),
    },
    method,
  });

beforeEach(() => {
  mocks.enabled = true;
  mocks.save.mockReset().mockResolvedValue(undefined);
  mocks.remove.mockReset().mockResolvedValue(undefined);
  vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "public");
  vi.stubEnv("VAPID_PRIVATE_KEY", "private");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/push/subscriptions", () => {
  it("stores the subscription for the signed-in user", async () => {
    const response = await POST(await request("POST", subscription), undefined);

    expect(response.status).toBe(201);
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ uid: "alice-uid" }),
      }),
      subscription,
    );
  });

  it("answers 401 without a session", async () => {
    const response = await POST(
      await request("POST", subscription, false),
      undefined,
    );

    expect(response.status).toBe(401);
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("answers 400 for a plain-HTTP endpoint", async () => {
    const response = await POST(
      await request("POST", {
        ...subscription,
        endpoint: "http://push.test/a",
      }),
      undefined,
    );

    expect(response.status).toBe(400);
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("answers 404 while the feature is off", async () => {
    mocks.enabled = false;

    const response = await POST(await request("POST", subscription), undefined);

    expect(response.status).toBe(404);
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("answers 503 when the VAPID keys are missing", async () => {
    vi.stubEnv("VAPID_PRIVATE_KEY", "");

    const response = await POST(await request("POST", subscription), undefined);

    expect(response.status).toBe(503);
    expect(mocks.save).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/push/subscriptions", () => {
  it("removes the device, even while the feature is off", async () => {
    mocks.enabled = false;

    const response = await DELETE(
      await request("DELETE", { endpoint }),
      undefined,
    );

    expect(response.status).toBe(200);
    expect(mocks.remove).toHaveBeenCalledWith(expect.anything(), endpoint);
  });

  it("answers 400 for a malformed body", async () => {
    const response = await DELETE(
      await request("DELETE", { endpoint: "nope" }),
      undefined,
    );

    expect(response.status).toBe(400);
  });
});
