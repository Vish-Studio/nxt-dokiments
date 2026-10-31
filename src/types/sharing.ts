import type { TemplateSnapshot } from "@/types/template";

/**
 * Lifecycle of one recipient on a shared document. `signed` is derived from
 * `SharedDocument.signatures` rather than stored by the recipient — see
 * docs/document-sharing.md for why a recipient cannot write their own status.
 */
export const shareRecipientStatuses = [
  "pending",
  "viewed",
  "signed",
  "revoked",
] as const;

export type ShareRecipientStatus = (typeof shareRecipientStatuses)[number];

/** Machine-readable reasons the sharing feature refuses a request. */
export const shareErrorCodes = [
  "SHARE_LIMIT_REACHED",
  "SHARE_SELF_NOT_ALLOWED",
  "DOCUMENT_LOCKED",
  "NOT_A_RECIPIENT",
  "SHARE_ALREADY_WITH_ANOTHER",
  "SHARE_NOT_SIGNABLE",
] as const;

export type ShareErrorCode = (typeof shareErrorCodes)[number];

/** One person a document has been shared with. */
export type ShareRecipient = {
  /** Normalised (trimmed, lower-cased) address — see `normaliseEmail`. */
  email: string;
  /**
   * Epoch milliseconds of each share email sent to this recipient in the last
   * 24 hours, oldest first. Drives the cooldown and the sender's daily cap, and
   * is pruned whenever a send is recorded.
   */
  emailedAt?: number[];
  /** Epoch milliseconds. */
  invitedAt: number;
  status: ShareRecipientStatus;
  /** Epoch milliseconds, set once the recipient has signed. */
  signedAt?: number;
  /** Known once the recipient has an account that is linked to this share. */
  uid?: string;
};

/** A recipient's signature. Only typed signatures exist for now. */
export type ShareSignature = {
  /** The signer's normalised address, taken from their auth token — lets a signature be matched to a recipient who has no linked uid yet. */
  email: string;
  /** Epoch milliseconds. */
  signedAt: number;
  type: "typed";
  value: string;
};

/**
 * A document that has been shared for signature. Lives at `sharedDocuments/{id}`
 * rather than under `users/{uid}` so that both the owner and the recipients can
 * read it; the owner's original in `users/{uid}/documents` is left untouched.
 */
export type SharedDocument = {
  createdAt: number;
  id: string;
  /** Once true nobody — including the owner — can change the document. */
  locked: boolean;
  /** Document title, copied from the source document. */
  name: string;
  ownerEmail: string;
  ownerId: string;
  ownerName: string;
  recipients: ShareRecipient[];
  /** Keyed by the signer's uid. */
  signatures: Record<string, ShareSignature>;
  /** The document the share was made from. */
  sourceDocumentId: string;
  templateId: string;
  updatedAt: number;
  values: Record<string, string>;
  templateSnapshot?: TemplateSnapshot;
};

/**
 * An entry in the owner's sharing ledger (`users/{uid}/shareRecipients/{email}`):
 * everyone this account has ever shared with, one entry per distinct address.
 * This is what a recipient limit counts, and it is never deleted from, so a
 * revoked share does not hand the place back.
 */
export type ShareLedgerEntry = {
  /** Epoch milliseconds. */
  firstSharedAt: number;
  email: string;
  /** Epoch milliseconds. */
  lastSharedAt: number;
};
