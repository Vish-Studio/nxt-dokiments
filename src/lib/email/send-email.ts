import "server-only";

import type { ReactElement } from "react";

import { render } from "@react-email/render";
import { Resend } from "resend";

import { getEmailConfig } from "./config";

export type SendEmailInput = {
  /** A single recipient address. Surrounding whitespace is trimmed. */
  to: string;
  /** A short summary of the email's purpose. */
  subject: string;
  /** Rendered to both HTML and plain text, so build it on `EmailLayout`. */
  react: ReactElement;
  /**
   * Makes retries safe: Resend delivers a given key once. Build it from what
   * makes the email logically unique (for example, share id, recipient and
   * `lastSharedAt`), never from a timestamp taken at send time.
   */
  idempotencyKey?: string;
  /** Overrides `EMAIL_REPLY_TO` for this message. */
  replyTo?: string;
};

/**
 * Why a send did not happen:
 *
 * - `disabled`: `RESEND_API_KEY` is not set.
 * - `blocked`: outside Production and the recipient is not on
 *   `EMAIL_PREVIEW_ALLOW_LIST`.
 * - `invalid-recipient`: `to` is not a plausible email address.
 * - `provider-error`: Resend rejected the request, or the call failed.
 */
export type SendEmailResult =
  | { ok: true; id: string }
  | {
      ok: false;
      reason: "disabled" | "blocked" | "invalid-recipient" | "provider-error";
    };

/** A plausibility check only. Resend does the strict validation. */
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/** `jane@example.com` becomes `j***@example.com`, so logs never hold full addresses. */
const maskEmail = (email: string) => {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
};

/**
 * Sends one transactional email through Resend. This is the only module that
 * talks to the provider, so features never import `resend` directly.
 *
 * It never throws. Callers decide what a failed send means, and a failed email
 * must not fail the request that triggered it. Run it after the response (for
 * example with `after()`) so users never wait on the provider.
 *
 * @example
 * after(async () => {
 *   const result = await sendEmail({
 *     to: recipientEmail,
 *     subject: "A document was shared with you",
 *     react: createElement(SharedDocumentEmail, { senderName, url }),
 *     idempotencyKey: `share-${shareId}-${recipientEmail}-${lastSharedAt}`,
 *   });
 *   if (!result.ok && result.reason === "provider-error") {
 *     console.error("[share] email failed", { shareId });
 *   }
 * });
 */
export const sendEmail = async ({
  to,
  subject,
  react,
  idempotencyKey,
  replyTo,
}: SendEmailInput): Promise<SendEmailResult> => {
  const config = getEmailConfig();

  if (config.mode === "disabled") {
    console.info("[email] skipped: RESEND_API_KEY is not set");
    return { ok: false, reason: "disabled" };
  }

  const recipient = to.trim();
  if (!EMAIL_PATTERN.test(recipient)) {
    console.warn("[email] skipped: invalid recipient");
    return { ok: false, reason: "invalid-recipient" };
  }

  if (
    config.mode === "restricted" &&
    !config.allowList.includes(recipient.toLowerCase())
  ) {
    console.info(
      `[email] blocked: ${maskEmail(recipient)} is not on EMAIL_PREVIEW_ALLOW_LIST`,
    );
    return { ok: false, reason: "blocked" };
  }

  try {
    const [html, text] = await Promise.all([
      render(react),
      render(react, { plainText: true }),
    ]);

    const { data, error } = await new Resend(config.apiKey).emails.send(
      {
        from: config.from,
        to: recipient,
        subject,
        html,
        text,
        replyTo: replyTo ?? config.replyTo,
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    );

    if (error || !data) {
      console.error(
        `[email] provider error for ${maskEmail(recipient)}: ${error?.name ?? "no data"}`,
      );
      return { ok: false, reason: "provider-error" };
    }

    return { ok: true, id: data.id };
  } catch (error) {
    console.error(
      `[email] send failed for ${maskEmail(recipient)}: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    return { ok: false, reason: "provider-error" };
  }
};
