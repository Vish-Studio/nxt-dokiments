import { describe, expect, it } from "vitest";

import { SubscribePushSchema, UnsubscribePushSchema } from "./push-schema";

const valid = {
  deviceLabel: "Chrome on macOS",
  endpoint: "https://fcm.googleapis.com/fcm/send/abc",
  keys: { auth: "auth", p256dh: "key" },
};

describe("SubscribePushSchema", () => {
  it("accepts a browser subscription", () => {
    expect(SubscribePushSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["a plain-HTTP endpoint", { ...valid, endpoint: "http://push.test/a" }],
    ["a non-URL endpoint", { ...valid, endpoint: "not a url" }],
    [
      "an over-long endpoint",
      { ...valid, endpoint: `https://x.test/${"a".repeat(2048)}` },
    ],
    ["a missing key", { ...valid, keys: { auth: "auth" } }],
    ["an empty key", { ...valid, keys: { auth: "", p256dh: "key" } }],
    ["an over-long label", { ...valid, deviceLabel: "x".repeat(101) }],
  ])("rejects %s", (_name, body) => {
    expect(SubscribePushSchema.safeParse(body).success).toBe(false);
  });
});

describe("UnsubscribePushSchema", () => {
  it("requires an HTTPS endpoint", () => {
    expect(
      UnsubscribePushSchema.safeParse({ endpoint: valid.endpoint }).success,
    ).toBe(true);
    expect(
      UnsubscribePushSchema.safeParse({ endpoint: "http://push.test/a" })
        .success,
    ).toBe(false);
  });
});
