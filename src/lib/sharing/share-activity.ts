import type {
  ShareRecipient,
  ShareRecipientStatus,
  ShareSignature,
  ShareView,
  SharedDocument,
} from "@/types/sharing";

/** What happened to a share, in the order the audit trail lists it. */
export type ShareEventKind = "shared" | "viewed" | "signed" | "revoked";

/** One line of a share's audit trail. */
export type ShareEvent = {
  /** Epoch milliseconds. */
  at: number;
  /** The recipient the event is about. */
  email: string;
  kind: ShareEventKind;
};

/**
 * The recipient who currently has access: the first one that has not been
 * revoked. A document has one active recipient at a time.
 *
 * @returns `undefined` when every recipient has been revoked.
 */
export const activeRecipient = (
  document: Pick<SharedDocument, "recipients">,
): ShareRecipient | undefined =>
  document.recipients.find((recipient) => recipient.status !== "revoked");

/**
 * The recipient a screen should talk about: the active one, or the most
 * recently added one when access has been revoked from everybody.
 */
export const currentRecipient = (
  document: Pick<SharedDocument, "recipients">,
): ShareRecipient | undefined =>
  activeRecipient(document) ?? document.recipients.at(-1);

/**
 * Works out a recipient's status from the records that prove it. A stored
 * `revoked` always wins. Otherwise a signature means `signed` and a view means
 * `viewed`, whatever the stored status says: recipients cannot write
 * `recipients`, so the signature and the view are the source of truth.
 *
 * A signature or view is matched to the recipient by uid when it is linked, and
 * by address otherwise.
 */
export const resolveRecipientStatus = (
  recipient: ShareRecipient,
  records: {
    signatures: Record<string, ShareSignature>;
    views?: Record<string, ShareView>;
  },
): { signedAt?: number; status: ShareRecipientStatus } => {
  if (recipient.status === "revoked") {
    return { signedAt: recipient.signedAt, status: "revoked" };
  }

  const matches = (uid: string, email: string) =>
    uid === recipient.uid || email === recipient.email;

  const signature = Object.entries(records.signatures).find(([uid, entry]) =>
    matches(uid, entry.email),
  )?.[1];
  if (signature) {
    return { signedAt: signature.signedAt, status: "signed" };
  }

  const viewed = Object.entries(records.views ?? {}).some(([uid, entry]) =>
    matches(uid, entry.email),
  );
  return {
    signedAt: recipient.signedAt,
    status: viewed ? "viewed" : "pending",
  };
};

/**
 * Builds the audit trail of a shared document, oldest first: when it was
 * shared, first viewed, signed and revoked, and for whom. It is derived from
 * what is already stored, so there is no separate log to keep in step.
 *
 * Re-sharing with a revoked address reactivates that recipient and clears
 * `revokedAt`, so the earlier revoke is not listed.
 */
export const shareTimeline = (document: SharedDocument): ShareEvent[] => {
  const events: ShareEvent[] = [];

  for (const recipient of document.recipients) {
    const { email } = recipient;
    events.push({ at: recipient.invitedAt, email, kind: "shared" });

    const view = Object.entries(document.views ?? {})
      .filter(([uid, entry]) => uid === recipient.uid || entry.email === email)
      .map(([, entry]) => entry.viewedAt)
      .sort((a, b) => a - b)[0];
    if (view !== undefined) {
      events.push({ at: view, email, kind: "viewed" });
    }

    const signature = Object.entries(document.signatures).find(
      ([uid, entry]) => uid === recipient.uid || entry.email === email,
    )?.[1];
    if (signature) {
      events.push({ at: signature.signedAt, email, kind: "signed" });
    }

    if (recipient.revokedAt !== undefined) {
      events.push({ at: recipient.revokedAt, email, kind: "revoked" });
    }
  }

  return events.sort((a, b) => a.at - b.at);
};
