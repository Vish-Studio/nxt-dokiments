import "server-only";

import { ApiError } from "@/lib/api/errors";
import {
  commitFirestoreWrites,
  FirestorePermissionDeniedError,
  getDocumentId,
  getFirestoreDocument,
  listFirestoreCollection,
  patchFirestoreDocument,
  runFirestoreQuery,
  readArray,
  readBoolean,
  readMap,
  readString,
  readTimestamp,
  toArrayValue,
  toBooleanValue,
  toMapValue,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
  type FirestoreFields,
  type FirestoreValue,
} from "@/lib/firebase/server-firestore";
import {
  getDocument,
  parseTemplateSnapshot,
  toTemplateSnapshotValue,
} from "@/lib/firebase/server-documents";
import { normaliseEmail } from "@/lib/sharing/email";
import { canShareWith } from "@/lib/sharing/policy";
import {
  isSignableDocument,
  RECIPIENT_SIGNATURE_KEY,
} from "@/lib/sharing/signable";
import { shareApiError } from "@/lib/sharing/server-guard";
import type { AuthSession } from "@/types/auth";
import {
  shareRecipientStatuses,
  type ShareLedgerEntry,
  type ShareRecipient,
  type ShareRecipientStatus,
  type ShareSignature,
  type SharedDocument,
} from "@/types/sharing";

/** Top-level collection holding every shared document. */
export const sharedDocumentsPath = "sharedDocuments";

/** Path of one shared document, e.g. `sharedDocuments/{id}`. */
export const sharedDocumentPath = (id: string) =>
  `${sharedDocumentsPath}/${id}`;

/** Path of an owner's sharing ledger collection, `users/{uid}/shareRecipients`. */
export const shareLedgerPath = (uid: string) => `users/${uid}/shareRecipients`;

/**
 * Path of one ledger entry. Entries are keyed by the normalised address itself,
 * so the address is normalised here and callers cannot create near-duplicates.
 */
export const shareLedgerEntryPath = (uid: string, email: string) =>
  `${shareLedgerPath(uid)}/${normaliseEmail(email)}`;

/** Reads a Firestore timestamp as epoch milliseconds, or `0` when absent or unparsable. */
const toMillis = (value: FirestoreValue | undefined) =>
  Date.parse(readTimestamp(value) ?? "") || 0;

/** Wraps a list of strings as a Firestore `arrayValue`. */
const toStringArray = (values: string[]) =>
  toArrayValue(values.map(toStringValue));

/** Serialises one recipient; `signedAt` and `uid` are omitted until known. */
const serialiseRecipient = (recipient: ShareRecipient) =>
  toMapValue({
    email: toStringValue(recipient.email),
    invitedAt: toTimestampValue(new Date(recipient.invitedAt)),
    status: toStringValue(recipient.status),
    ...(recipient.emailedAt?.length
      ? {
          emailedAt: toArrayValue(
            recipient.emailedAt.map((at) => toTimestampValue(new Date(at))),
          ),
        }
      : {}),
    ...(recipient.signedAt === undefined
      ? {}
      : { signedAt: toTimestampValue(new Date(recipient.signedAt)) }),
    ...(recipient.uid ? { uid: toStringValue(recipient.uid) } : {}),
  });

/** Deserialises one recipient, treating an unknown stored status as `pending`. */
const parseRecipient = (value: FirestoreValue): ShareRecipient => {
  const fields = readMap(value);
  const status = readString(fields.status);

  const emailedAt = readArray(fields.emailedAt).map(toMillis);

  return {
    email: readString(fields.email) ?? "",
    emailedAt: emailedAt.length ? emailedAt : undefined,
    invitedAt: toMillis(fields.invitedAt),
    signedAt: fields.signedAt ? toMillis(fields.signedAt) : undefined,
    status: shareRecipientStatuses.includes(status as ShareRecipientStatus)
      ? (status as ShareRecipientStatus)
      : "pending",
    uid: readString(fields.uid),
  };
};

/** Serialises a signature, normalising the signer's address. */
const serialiseSignature = (signature: ShareSignature) =>
  toMapValue({
    email: toStringValue(normaliseEmail(signature.email)),
    signedAt: toTimestampValue(new Date(signature.signedAt)),
    type: toStringValue(signature.type),
    value: toStringValue(signature.value),
  });

/** Serialises the `signatures` map, keyed by the signer's uid. */
const serialiseSignatures = (signatures: Record<string, ShareSignature>) =>
  toMapValue(
    Object.fromEntries(
      Object.entries(signatures).map(([uid, signature]) => [
        uid,
        serialiseSignature(signature),
      ]),
    ),
  );

/** Deserialises a signature. */
const parseSignature = (value: FirestoreValue): ShareSignature => {
  const fields = readMap(value);
  return {
    email: readString(fields.email) ?? "",
    signedAt: toMillis(fields.signedAt),
    type: "typed",
    value: readString(fields.value) ?? "",
  };
};

/**
 * Serialises a shared document for a Firestore write.
 *
 * Besides `recipients`, it writes `recipientEmails` and `recipientUids` as flat
 * string arrays. Security rules cannot look inside an array of maps, so they
 * authorise against these two; they are always derived from `recipients` here so
 * the three can never disagree.
 *
 * `templateSnapshot` is passed in already serialised, since the document module
 * that owns that format is the one that knows how to build it.
 */
export const toSharedDocumentFields = (
  document: Omit<SharedDocument, "id" | "templateSnapshot">,
  templateSnapshot?: FirestoreValue,
): FirestoreFields => ({
  createdAt: toTimestampValue(new Date(document.createdAt)),
  locked: toBooleanValue(document.locked),
  name: toStringValue(document.name),
  ownerEmail: toStringValue(document.ownerEmail),
  ownerId: toStringValue(document.ownerId),
  ownerName: toStringValue(document.ownerName),
  recipientEmails: toStringArray(
    document.recipients.map((recipient) => recipient.email),
  ),
  recipientUids: toStringArray(
    document.recipients.flatMap((recipient) =>
      recipient.uid ? [recipient.uid] : [],
    ),
  ),
  recipients: toArrayValue(document.recipients.map(serialiseRecipient)),
  signatures: serialiseSignatures(document.signatures),
  sourceDocumentId: toStringValue(document.sourceDocumentId),
  templateId: toStringValue(document.templateId),
  updatedAt: toTimestampValue(new Date(document.updatedAt)),
  values: toMapValue(
    Object.fromEntries(
      Object.entries(document.values).map(([key, value]) => [
        key,
        toStringValue(value),
      ]),
    ),
  ),
  ...(templateSnapshot ? { templateSnapshot } : {}),
});

/**
 * Deserialises a `sharedDocuments/{id}` document. A recipient who has a
 * signature is reported as `signed` whatever their stored status says — the
 * signature is the source of truth, because recipients cannot write `recipients`.
 *
 * `templateSnapshot` is left to the caller (it shares its parser with
 * `UserDocument`); only the sharing-specific fields are handled here.
 */
export const parseSharedDocument = (
  document: FirestoreDocument,
  knownId?: string,
): Omit<SharedDocument, "templateSnapshot"> => {
  const fields = document.fields;
  const signatures = Object.fromEntries(
    Object.entries(readMap(fields?.signatures)).map(([uid, value]) => [
      uid,
      parseSignature(value),
    ]),
  );

  return {
    createdAt: toMillis(fields?.createdAt),
    id: knownId ?? getDocumentId(document),
    locked: readBoolean(fields?.locked) ?? false,
    name: readString(fields?.name) ?? "",
    ownerEmail: readString(fields?.ownerEmail) ?? "",
    ownerId: readString(fields?.ownerId) ?? "",
    ownerName: readString(fields?.ownerName) ?? "",
    recipients: readArray(fields?.recipients)
      .map(parseRecipient)
      .map((recipient) => {
        const signature =
          (recipient.uid ? signatures[recipient.uid] : undefined) ??
          Object.values(signatures).find(
            (candidate) => candidate.email === recipient.email,
          );
        return signature
          ? {
              ...recipient,
              signedAt: signature.signedAt,
              status: "signed" as const,
            }
          : recipient;
      }),
    signatures,
    sourceDocumentId: readString(fields?.sourceDocumentId) ?? "",
    templateId: readString(fields?.templateId) ?? "",
    updatedAt: toMillis(fields?.updatedAt),
    values: Object.fromEntries(
      Object.entries(readMap(fields?.values)).map(([key, value]) => [
        key,
        readString(value) ?? "",
      ]),
    ),
  };
};

/**
 * Serialises a ledger entry for a write to `shareLedgerEntryPath`. The `email`
 * field repeats the document ID because the security rules require them to match.
 */
export const toShareLedgerFields = (
  entry: ShareLedgerEntry,
): FirestoreFields => ({
  email: toStringValue(normaliseEmail(entry.email)),
  firstSharedAt: toTimestampValue(new Date(entry.firstSharedAt)),
  lastSharedAt: toTimestampValue(new Date(entry.lastSharedAt)),
});

/**
 * Everyone the signed-in user has ever shared a document with, most recently
 * shared first. Backs the share dialog's suggestions.
 *
 * @throws When the Firestore request fails.
 */
export const listShareRecipients = async (
  session: AuthSession,
): Promise<ShareLedgerEntry[]> => {
  const entries = await listFirestoreCollection(
    shareLedgerPath(session.user.uid),
    session.idToken,
  );

  return entries
    .map((entry) => ({
      email: normaliseEmail(getDocumentId(entry)),
      firstSharedAt: toMillis(entry.fields?.firstSharedAt),
      lastSharedAt: toMillis(entry.fields?.lastSharedAt),
    }))
    .sort((a, b) => b.lastSharedAt - a.lastSharedAt);
};

/**
 * ID of the shared document made from one of an owner's documents. Deterministic,
 * so sharing the same document again finds the existing share instead of
 * creating a second one.
 */
export const sharedDocumentIdFor = (
  ownerUid: string,
  sourceDocumentId: string,
) => `${ownerUid}_${sourceDocumentId}`;

/** Parses a `sharedDocuments/{id}` document including its template snapshot. */
export const readSharedDocument = (
  document: FirestoreDocument,
  knownId?: string,
): SharedDocument => ({
  ...parseSharedDocument(document, knownId),
  templateSnapshot: parseTemplateSnapshot(document),
});

/** The outcome of `shareDocument`. */
export type ShareDocumentResult = {
  /** `true` on the first share of this document, `false` when re-sharing. */
  created: boolean;
  /** Title of the shared copy, for the notification email. */
  documentName: string;
  recipient: ShareRecipient;
  /** Epoch milliseconds of this share; unique per explicit share or re-share. */
  sharedAt: number;
  sharedDocumentId: string;
};

/**
 * Shares one of the signed-in user's documents with `rawEmail`.
 *
 * Copies the document (name, values, template snapshot) into `sharedDocuments`
 * and records the address in the owner's ledger, in one atomic commit. Sharing
 * again with the same address is idempotent and refreshes the copy while the
 * document is unlocked. The first share is limited to one recipient per document.
 *
 * The recipient's account is not looked up: the server cannot read another
 * user's profile, and the rules recognise a recipient by verified address.
 *
 * @param session - Active session of the owner.
 * @param sourceDocumentId - ID of the owner's document to share.
 * @param rawEmail - Recipient address, in any casing.
 * @throws `ApiError` 404 for an unknown document; the sharing errors in
 *   `shareApiError` for self-share, locked, second recipient and plan limit.
 */
export const shareDocument = async (
  session: AuthSession,
  sourceDocumentId: string,
  rawEmail: string,
): Promise<ShareDocumentResult> => {
  const { uid } = session.user;
  const email = normaliseEmail(rawEmail);

  const source = await getDocument(session, sourceDocumentId);
  if (!source) {
    throw new ApiError(404, "Document not found.");
  }

  if (!isSignableDocument(source.templateSnapshot)) {
    throw shareApiError("SHARE_NOT_SIGNABLE");
  }

  const sharedDocumentId = sharedDocumentIdFor(uid, sourceDocumentId);
  const [existing, ledger] = await Promise.all([
    getSharedDocument(session, sharedDocumentId),
    listFirestoreCollection(shareLedgerPath(uid), session.idToken),
  ]);

  if (existing?.locked) {
    throw shareApiError("DOCUMENT_LOCKED");
  }

  const otherRecipient = existing?.recipients.find(
    (recipient) => recipient.email !== email,
  );
  if (otherRecipient) {
    throw shareApiError("SHARE_ALREADY_WITH_ANOTHER");
  }

  const ledgerEmails = ledger.map((entry) =>
    normaliseEmail(getDocumentId(entry)),
  );
  const decision = canShareWith({
    email,
    ownerEmail: session.user.email,
    ownerRole: session.user.role,
    sharedWith: ledgerEmails,
  });
  if (!decision.allowed) {
    throw shareApiError(decision.reason);
  }

  const now = Date.now();
  const recipient: ShareRecipient = existing?.recipients[0] ?? {
    email,
    invitedAt: now,
    status: "pending",
  };
  const ledgerEntry = ledger.find(
    (entry) => normaliseEmail(getDocumentId(entry)) === email,
  );

  const committed = await commitFirestoreWrites(
    [
      {
        fields: toSharedDocumentFields(
          {
            createdAt: existing?.createdAt ?? now,
            locked: false,
            name: source.name,
            ownerEmail: session.user.email,
            ownerId: uid,
            ownerName: session.user.displayName,
            recipients: [recipient],
            signatures: existing?.signatures ?? {},
            sourceDocumentId,
            templateId: source.templateId,
            updatedAt: now,
            // Only the recipient signs that field, so whatever the owner typed there never travels.
            values: Object.fromEntries(
              Object.entries(source.values).filter(
                ([key]) => key !== RECIPIENT_SIGNATURE_KEY,
              ),
            ),
          },
          source.templateSnapshot
            ? toTemplateSnapshotValue(source.templateSnapshot)
            : undefined,
        ),
        mustExist: existing !== null,
        path: sharedDocumentPath(sharedDocumentId),
      },
      {
        fields: toShareLedgerFields({
          email,
          firstSharedAt: ledgerEntry
            ? toMillis(ledgerEntry.fields?.firstSharedAt)
            : now,
          lastSharedAt: now,
        }),
        mustExist: ledgerEntry !== undefined,
        path: shareLedgerEntryPath(uid, email),
      },
    ],
    session.idToken,
  );

  if (!committed) {
    throw new ApiError(
      409,
      "This document was just shared by another request. Please try again.",
    );
  }

  return {
    created: existing === null,
    documentName: source.name,
    recipient,
    sharedAt: now,
    sharedDocumentId,
  };
};

/**
 * Fetches one shared document the signed-in user owns or has received.
 *
 * @returns The document, or `null` when it does not exist or the user may not
 *   see it. The rules refuse a read of an absent or foreign document, so a
 *   refusal is reported as `null` — the caller cannot tell the two apart, by design.
 * @throws When the Firestore request fails for any other reason.
 */
export const getSharedDocument = async (
  session: AuthSession,
  id: string,
): Promise<SharedDocument | null> => {
  try {
    const document = await getFirestoreDocument(
      sharedDocumentPath(id),
      session.idToken,
    );
    return document ? readSharedDocument(document, id) : null;
  } catch (error) {
    if (error instanceof FirestorePermissionDeniedError) return null;
    throw error;
  }
};

/**
 * Lists the documents shared with the signed-in user, newest first.
 *
 * Matches on the verified address in the token, so an unverified account
 * receives an empty list rather than an error.
 *
 * @throws When the Firestore query fails for any other reason.
 */
export const listSharedWithMe = async (
  session: AuthSession,
): Promise<SharedDocument[]> => {
  try {
    const documents = await runFirestoreQuery(
      sharedDocumentsPath,
      {
        field: "recipientEmails",
        op: "ARRAY_CONTAINS",
        value: toStringValue(normaliseEmail(session.user.email)),
      },
      session.idToken,
    );

    return documents
      .map((document) => readSharedDocument(document))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    if (
      error instanceof FirestorePermissionDeniedError &&
      session.user.emailVerified !== true
    ) {
      return [];
    }
    throw error;
  }
};

/**
 * Lists the documents the signed-in user has shared with others, newest first.
 * Backs the "View shared copy" row action.
 *
 * @throws When the Firestore query fails.
 */
export const listSharedByMe = async (
  session: AuthSession,
): Promise<SharedDocument[]> => {
  const documents = await runFirestoreQuery(
    sharedDocumentsPath,
    {
      field: "ownerId",
      op: "EQUAL",
      value: toStringValue(session.user.uid),
    },
    session.idToken,
  );

  return documents
    .map((document) => readSharedDocument(document))
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

/**
 * Signs a document shared with the signed-in user and locks it, in one write.
 * Only a recipient can sign (not the owner), and only while the document is
 * unlocked. With one recipient per document, their signature completes it.
 *
 * The rules re-check every condition on the write itself, so a request that
 * races a lock or a second signature is refused there too.
 *
 * @param session - Active session of the recipient.
 * @param id - ID of the shared document.
 * @param value - The typed signature, already validated.
 * @returns The signed, locked document.
 * @throws `NOT_A_RECIPIENT` (404) when the document is unknown or not shared
 *   with the caller; `DOCUMENT_LOCKED` (409) when it is already signed.
 */
export const signSharedDocument = async (
  session: AuthSession,
  id: string,
  value: string,
): Promise<SharedDocument> => {
  const { uid } = session.user;
  const email = normaliseEmail(session.user.email);

  const document = await getSharedDocument(session, id);
  const isRecipient = document?.recipients.some(
    (recipient) => recipient.uid === uid || recipient.email === email,
  );
  if (!document || !isRecipient) {
    throw shareApiError("NOT_A_RECIPIENT");
  }
  if (document.locked) {
    throw shareApiError("DOCUMENT_LOCKED");
  }

  const now = Date.now();
  const signatures: Record<string, ShareSignature> = {
    ...document.signatures,
    [uid]: { email, signedAt: now, type: "typed", value },
  };

  try {
    const written = await patchFirestoreDocument(
      sharedDocumentPath(id),
      {
        locked: toBooleanValue(true),
        signatures: serialiseSignatures(signatures),
        updatedAt: toTimestampValue(new Date(now)),
      },
      session.idToken,
      ["locked", "signatures", "updatedAt"],
    );
    return readSharedDocument(written, id);
  } catch (error) {
    if (error instanceof FirestorePermissionDeniedError) {
      throw shareApiError("DOCUMENT_LOCKED");
    }
    throw error;
  }
};

/**
 * Records that a share email went to the recipient of `id`, keeping only the
 * sends from the last 24 hours. Writes just the `recipients` field, so a
 * concurrent edit to anything else is not overwritten.
 *
 * @param session - Active session of the owner.
 * @param id - ID of the shared document.
 * @param email - The recipient that was emailed.
 * @param emailedAt - Epoch milliseconds of the send.
 * @param windowMs - How far back sends are kept.
 * @returns `false` when the share no longer exists, is locked, or has no such recipient.
 * @throws When the Firestore request fails for a reason other than a refused write.
 */
export const recordShareEmail = async (
  session: AuthSession,
  id: string,
  email: string,
  emailedAt: number,
  windowMs: number,
): Promise<boolean> => {
  const document = await getSharedDocument(session, id);
  const target = normaliseEmail(email);
  if (!document || document.locked) {
    return false;
  }
  if (!document.recipients.some((recipient) => recipient.email === target)) {
    return false;
  }

  const recipients = document.recipients.map((recipient) =>
    recipient.email === target
      ? {
          ...recipient,
          emailedAt: [
            ...(recipient.emailedAt ?? []).filter(
              (at) => at > emailedAt - windowMs,
            ),
            emailedAt,
          ],
        }
      : recipient,
  );

  try {
    await patchFirestoreDocument(
      sharedDocumentPath(id),
      { recipients: toArrayValue(recipients.map(serialiseRecipient)) },
      session.idToken,
      ["recipients"],
    );
    return true;
  } catch (error) {
    if (error instanceof FirestorePermissionDeniedError) {
      return false;
    }
    throw error;
  }
};
