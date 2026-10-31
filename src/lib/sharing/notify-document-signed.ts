import "server-only";

import { createElement } from "react";

import { cleanEmailLabel, personLabel } from "@/lib/email/clean-label";
import { hashedIdempotencyKey } from "@/lib/email/idempotency-key";
import { sendEmail } from "@/lib/email/send-email";
import {
  SignedDocumentEmail,
  signedDocumentEmailSubject,
} from "@/lib/email/templates/signed-document-email";
import { siteUrl } from "@/lib/seo/site";
import type { AuthSession } from "@/types/auth";
import type { SharedDocument } from "@/types/sharing";

/** What happened, mostly for tests and logs. Callers don't need to act on it. */
export type NotifyDocumentSignedResult =
  | { sent: true }
  | {
      sent: false;
      reason:
        | "no-signature"
        | "disabled"
        | "blocked"
        | "invalid-recipient"
        | "provider-error"
        | "error";
    };

const signedAtFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** Formats a signature time for the email, always in UTC so it is unambiguous. */
const formatSignedAt = (signedAt: number) =>
  `${signedAtFormatter.format(signedAt)} UTC`;

/**
 * Emails the owner of a shared document that the recipient signed it. Meant to
 * run inside `after()` from the sign route, so signing never waits on the
 * provider and never fails because of it.
 *
 * It runs as the signer and has no way to read the owner's account, so it
 * writes to the `ownerEmail` stored on the share. A document signs once and then
 * locks, so there is no cooldown or cap and nothing to record afterwards. The
 * idempotency key still makes a retried request deliver once. It never throws.
 *
 * @param session - Active session of the recipient who signed.
 * @param document - The signed document, as returned by `signSharedDocument`.
 * @returns Whether an email was sent, or why not.
 *
 * @example
 * after(() => notifyDocumentSigned(session, document));
 */
export const notifyDocumentSigned = async (
  session: AuthSession,
  document: SharedDocument,
): Promise<NotifyDocumentSignedResult> => {
  try {
    const { uid } = session.user;
    const signature = document.signatures[uid];
    if (!signature) {
      return { reason: "no-signature", sent: false };
    }

    const props = {
      documentName: cleanEmailLabel(document.name),
      signedAtLabel: formatSignedAt(signature.signedAt),
      signerName: personLabel(session.user),
    };

    const result = await sendEmail({
      idempotencyKey: hashedIdempotencyKey(
        "signed",
        document.id,
        uid,
        signature.signedAt,
      ),
      react: createElement(SignedDocumentEmail, {
        ...props,
        url: `${siteUrl}/my-documents/shared/${encodeURIComponent(document.id)}`,
      }),
      subject: signedDocumentEmailSubject(props),
      to: document.ownerEmail,
    });
    if (!result.ok) {
      return { reason: result.reason, sent: false };
    }

    return { sent: true };
  } catch (error) {
    console.error(
      `[signed-email] failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return { reason: "error", sent: false };
  }
};
