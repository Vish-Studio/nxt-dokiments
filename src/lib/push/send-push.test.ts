import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteSubscription: vi.fn(),
  enabled: true,
  list: vi.fn(),
  send: vi.fn(),
}));

vi.mock("web-push", () => ({
  sendNotification: mocks.send,
}));

vi.mock("@/lib/push/feature-flag", () => ({
  get pushNotificationsEnabled() {
    return mocks.enabled;
  },
}));

vi.mock("@/lib/firebase/server-push-subscriptions", () => ({
  deletePushSubscription: mocks.deleteSubscription,
  listPushSubscriptions: mocks.list,
}));

import type { AuthSession } from "@/types/auth";

import { sendPushToUser } from "./send-push";

const session = {
  idToken: "token",
  user: { uid: "alice-uid" },
} as unknown as AuthSession;

const payload = { body: "Body", title: "Title", url: "/" };

const device = (endpoint: string) => ({
  createdAt: 0,
  endpoint,
  id: endpoint,
  keys: { auth: "a", p256dh: "p" },
});

beforeEach(() => {
  mocks.enabled = true;
  mocks.send.mockReset().mockResolvedValue({});
  mocks.list.mockReset().mockResolvedValue([]);
  mocks.deleteSubscription.mockReset().mockResolvedValue(undefined);
  vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "public");
  vi.stubEnv("VAPID_PRIVATE_KEY", "private");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("sendPushToUser", () => {
  it("sends to every subscribed device", async () => {
    mocks.list.mockResolvedValue([device("https://a"), device("https://b")]);

    const result = await sendPushToUser(session, payload);

    expect(result).toEqual({ ok: true, removed: 0, sent: 2 });
    expect(mocks.send).toHaveBeenCalledTimes(2);
    expect(JSON.parse(mocks.send.mock.calls[0][1])).toEqual(payload);
  });

  it("succeeds with nothing sent when the user has no devices", async () => {
    expect(await sendPushToUser(session, payload)).toEqual({
      ok: true,
      removed: 0,
      sent: 0,
    });
  });

  it("removes a subscription the push service reports as gone", async () => {
    mocks.list.mockResolvedValue([
      device("https://gone"),
      device("https://ok"),
    ]);
    mocks.send.mockImplementation(
      async (subscription: { endpoint: string }) => {
        if (subscription.endpoint === "https://gone") {
          throw Object.assign(new Error("gone"), { statusCode: 410 });
        }
      },
    );

    const result = await sendPushToUser(session, payload);

    expect(result).toEqual({ ok: true, removed: 1, sent: 1 });
    expect(mocks.deleteSubscription).toHaveBeenCalledWith(
      session,
      "https://gone",
    );
  });

  it("keeps a subscription after a transient failure and never logs its endpoint", async () => {
    mocks.list.mockResolvedValue([device("https://secret-endpoint")]);
    mocks.send.mockRejectedValue(
      Object.assign(new Error("boom"), { statusCode: 500 }),
    );

    const result = await sendPushToUser(session, payload);

    expect(result).toEqual({ ok: true, removed: 0, sent: 0 });
    expect(mocks.deleteSubscription).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      "secret-endpoint",
    );
  });

  it("does nothing while the feature is off", async () => {
    mocks.enabled = false;

    expect(await sendPushToUser(session, payload)).toEqual({
      ok: false,
      reason: "disabled",
    });
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("does nothing without VAPID keys", async () => {
    vi.stubEnv("VAPID_PRIVATE_KEY", "");

    expect(await sendPushToUser(session, payload)).toEqual({
      ok: false,
      reason: "disabled",
    });
  });

  it("never throws when the device list cannot be read", async () => {
    mocks.list.mockRejectedValue(new Error("firestore down"));

    expect(await sendPushToUser(session, payload)).toEqual({
      ok: false,
      reason: "error",
    });
  });
});
