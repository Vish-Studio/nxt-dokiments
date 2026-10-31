import "server-only";

import { createElement } from "react";

import { cleanEmailLabel, personLabel } from "@/lib/email/clean-label";
import { hashedIdempotencyKey } from "@/lib/email/idempotency-key";
import { sendEmail } from "@/lib/email/send-email";
import {
  SharedDocumentEmail,
  sharedDocumentEmailSubject,
} from "@/lib/email/templates/shared-document-email";
import {
  listSharedByMe,
  recordShareEmail,
} from "@/lib/firebase/server-shared-documents";
import { siteUrl } from "@/lib/seo/site";
import {
  decideShareEmail,
  SHARE_EMAIL_WINDOW_MS,
} from "@/lib/sharing/share-email-limits";
import type { AuthSession } from "@/types/auth";

export type NotifyDocumentSharedInput = {
  /** `true` for the first share, which sends the "shared" wording. */
  created: boolean;
  /** Title of the shared document. */
  documentName: string;
  /** Address the document was shared with. */
  recipientEmail: string;
  /** Epoch milliseconds of this share, from `shareDocument`. */
  sharedAt: number;
  sharedDocumentId: string;
};

/** What happened, mostly for tests and logs. Callers don't need to act on it. */
export type NotifyDocumentSharedResult =
  | { sent: true }
  | {
      sent: false;
      reason:
        | "cooldown"
        | "daily-cap"
        | "disabled"
        | "blocked"
        | "invalid-recipient"
        | "provider-error"
        | "error";
    };

/** Opens the Shared with me tab of the recipient's documents. */
const sharedTabUrl = () => `${siteUrl}/my-documents?tab=shared`;

/**
 * Emails the recipient of a share, unless a limit says to hold it back. Meant to
 * run inside `after()` from the share route, so the share itself never waits on
 * the provider and never fails because of it.
 *
 * Order: read the sender's shares, apply the cooldown and daily cap, send, and
 * only then record the send so a failed or blocked email doesn't use up a limit.
 * It never throws.
 *
 * The idempotency key is built from the share and its `sharedAt`, so a retry of
 * the same share sends once, while each deliberate re-share is a new email.
 *
 * @param session - Active session of the sender.
 * @param input - What was shared and with whom.
 * @returns Whether an email was sent, or why not.
 *
 * @example
 * after(() => notifyDocumentShared(session, { created, documentName, recipientEmail, sharedAt, sharedDocumentId }));
 */
export const notifyDocumentShared = async (
  session: AuthSession,
  input: NotifyDocumentSharedInput,
): Promise<NotifyDocumentSharedResult> => {
  try {
    const shares = await listSharedByMe(session);
    const decision = decideShareEmail({
      now: Date.now(),
      recipientEmail: input.recipientEmail,
      sharedDocumentId: input.sharedDocumentId,
      shares,
    });
    if (decision !== "send") {
      console.info(`[share-email] held back: ${decision}`);
      return { reason: decision, sent: false };
    }

    const props = {
      documentName: cleanEmailLabel(input.documentName),
      senderName: personLabel(session.user),
      variant: input.created ? ("shared" as const) : ("updated" as const),
    };

    const result = await sendEmail({
      idempotencyKey: hashedIdempotencyKey(
        "share",
        input.sharedDocumentId,
        input.recipientEmail,
        input.sharedAt,
      ),
      react: createElement(SharedDocumentEmail, {
        ...props,
        url: sharedTabUrl(),
      }),
      subject: sharedDocumentEmailSubject(props),
      to: input.recipientEmail,
    });
    if (!result.ok) {
      return { reason: result.reason, sent: false };
    }

    await recordShareEmail(
      session,
      input.sharedDocumentId,
      input.recipientEmail,
      Date.now(),
      SHARE_EMAIL_WINDOW_MS,
    );
    return { sent: true };
  } catch (error) {
    console.error(
      `[share-email] failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return { reason: "error", sent: false };
  }
};
