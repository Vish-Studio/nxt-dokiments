import { createElement } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { sendEmail } from "./send-email";
import { EmailLayout } from "./templates/email-layout";

const react = createElement(EmailLayout, {
  preview: "Preview text",
  heading: "Hello",
});

const input = { to: "jane@example.com", subject: "Hi", react };

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("sendEmail", () => {
  it("does nothing and never throws when no API key is set", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    await expect(sendEmail(input)).resolves.toEqual({
      ok: false,
      reason: "disabled",
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed recipient", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "production");

    await expect(sendEmail({ ...input, to: "not-an-email" })).resolves.toEqual({
      ok: false,
      reason: "invalid-recipient",
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("blocks recipients off the allow-list outside production", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("EMAIL_PREVIEW_ALLOW_LIST", "me@example.com");

    await expect(sendEmail(input)).resolves.toEqual({
      ok: false,
      reason: "blocked",
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends to an allow-listed recipient, case-insensitively", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("EMAIL_PREVIEW_ALLOW_LIST", "Jane@Example.com");

    await expect(sendEmail(input)).resolves.toEqual({
      ok: true,
      id: "email_1",
    });
  });

  it("ignores the allow-list in production", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("EMAIL_PREVIEW_ALLOW_LIST", "someone-else@example.com");

    await expect(sendEmail(input)).resolves.toEqual({
      ok: true,
      id: "email_1",
    });
  });

  it("sends html and plain text with the configured sender and reply-to", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("EMAIL_FROM", "Acme <hi@mail.acme.com>");
    vi.stubEnv("EMAIL_REPLY_TO", "support@acme.com");

    await sendEmail(input);

    const [payload] = sendMock.mock.calls[0];
    expect(payload).toMatchObject({
      from: "Acme <hi@mail.acme.com>",
      to: "jane@example.com",
      subject: "Hi",
      replyTo: "support@acme.com",
    });
    expect(payload.html).toContain("Hello");
    expect(payload.text).toContain("Hello");
    expect(payload.text).not.toContain("<");
  });

  it("lets a call override the reply-to", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("EMAIL_REPLY_TO", "support@acme.com");

    await sendEmail({ ...input, replyTo: "owner@acme.com" });

    expect(sendMock.mock.calls[0][0].replyTo).toBe("owner@acme.com");
  });

  it("passes the idempotency key to the provider", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "production");

    await sendEmail({ ...input, idempotencyKey: "share-1-jane-2" });

    expect(sendMock.mock.calls[0][1]).toEqual({
      idempotencyKey: "share-1-jane-2",
    });
  });

  it("reports a provider error without throwing", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "production");
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "bad" },
    });

    await expect(sendEmail(input)).resolves.toEqual({
      ok: false,
      reason: "provider-error",
    });
  });

  it("reports a thrown provider failure without throwing", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "production");
    sendMock.mockRejectedValue(new Error("network down"));

    await expect(sendEmail(input)).resolves.toEqual({
      ok: false,
      reason: "provider-error",
    });
  });

  it("never logs the full recipient address", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("EMAIL_PREVIEW_ALLOW_LIST", "me@example.com");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await sendEmail(input);

    expect(JSON.stringify(info.mock.calls)).not.toContain("jane@example.com");
  });
});
