import "server-only";

import {
  getDocumentId,
  listFirestoreCollection,
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
import { normaliseEmail } from "@/lib/sharing/email";
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
    ...(recipient.signedAt === undefined
      ? {}
      : { signedAt: toTimestampValue(new Date(recipient.signedAt)) }),
    ...(recipient.uid ? { uid: toStringValue(recipient.uid) } : {}),
  });

/** Deserialises one recipient, treating an unknown stored status as `pending`. */
const parseRecipient = (value: FirestoreValue): ShareRecipient => {
  const fields = readMap(value);
  const status = readString(fields.status);

  return {
    email: readString(fields.email) ?? "",
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
  signatures: toMapValue(
    Object.fromEntries(
      Object.entries(document.signatures).map(([uid, signature]) => [
        uid,
        serialiseSignature(signature),
      ]),
    ),
  ),
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
 * Everyone the signed-in user has ever shared a document with, as normalised
 * addresses — the `sharedWith` input of `canShareWith`.
 *
 * @throws When the Firestore request fails.
 */
export const listShareRecipientEmails = async (
  session: AuthSession,
): Promise<string[]> => {
  const entries = await listFirestoreCollection(
    shareLedgerPath(session.user.uid),
    session.idToken,
  );
  return entries.map((entry) => normaliseEmail(getDocumentId(entry)));
};
