import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_EMAIL_FROM,
  getEmailConfig,
  hasEmailConfig,
  parseAllowList,
  resolveEmailMode,
} from "./config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("parseAllowList", () => {
  it("trims, lower-cases and drops empty items", () => {
    expect(parseAllowList(" You@Gmail.com, ,team@Example.com,")).toEqual([
      "you@gmail.com",
      "team@example.com",
    ]);
  });

  it("returns an empty list when unset", () => {
    expect(parseAllowList(undefined)).toEqual([]);
  });
});

describe("resolveEmailMode", () => {
  it("is disabled without an API key, whatever the environment", () => {
    expect(resolveEmailMode({ apiKey: "", vercelEnv: "production" })).toBe(
      "disabled",
    );
  });

  it("is live only in Vercel production", () => {
    expect(resolveEmailMode({ apiKey: "re_x", vercelEnv: "production" })).toBe(
      "live",
    );
  });

  it("is restricted in preview and local development", () => {
    expect(resolveEmailMode({ apiKey: "re_x", vercelEnv: "preview" })).toBe(
      "restricted",
    );
    expect(resolveEmailMode({ apiKey: "re_x", vercelEnv: undefined })).toBe(
      "restricted",
    );
  });
});

describe("getEmailConfig", () => {
  it("falls back to the default sender and no reply-to", () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("EMAIL_FROM", "");
    vi.stubEnv("EMAIL_REPLY_TO", "");

    const config = getEmailConfig();

    expect(config.from).toBe(DEFAULT_EMAIL_FROM);
    expect(config.replyTo).toBeUndefined();
  });

  it("reads the sender, reply-to and allow-list from the environment", () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("EMAIL_FROM", "Acme <hi@mail.acme.com>");
    vi.stubEnv("EMAIL_REPLY_TO", "support@acme.com");
    vi.stubEnv("EMAIL_PREVIEW_ALLOW_LIST", "a@x.com,B@x.com");
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(getEmailConfig()).toEqual({
      apiKey: "re_x",
      from: "Acme <hi@mail.acme.com>",
      replyTo: "support@acme.com",
      mode: "restricted",
      allowList: ["a@x.com", "b@x.com"],
    });
  });
});

describe("hasEmailConfig", () => {
  it("reflects whether an API key is present", () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(hasEmailConfig()).toBe(false);

    vi.stubEnv("RESEND_API_KEY", "re_x");
    expect(hasEmailConfig()).toBe(true);
  });
});
