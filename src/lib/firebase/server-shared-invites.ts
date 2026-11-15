import "server-only";

import { maskEmail } from "@/lib/email/mask-email";
import {
  appendFirestoreArrayElements,
  deleteFirestoreDocument,
  FirestorePermissionDeniedError,
  getDocumentId,
  getFirestoreDocument,
  patchFirestoreDocument,
  readMap,
  readString,
  readTimestamp,
  runFirestoreQuery,
  toMapValue,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
  type FirestoreFields,
} from "@/lib/firebase/server-firestore";
import {
  parseTemplateSnapshot,
  toTemplateSnapshotValue,
} from "@/lib/firebase/server-documents";
import {
  getSharedDocument,
  sharedDocumentPath,
} from "@/lib/firebase/server-shared-documents";
import { normaliseEmail } from "@/lib/sharing/email";
import {
  generateInviteToken,
  hashInviteToken,
  INVITE_TTL_MS,
  isInviteTokenShape,
  type InviteToken,
} from "@/lib/sharing/invite-token";
import type { AuthSession } from "@/types/auth";
import type { SharedDocument, SharedInvite } from "@/types/sharing";

/** Top-level collection holding every invite, keyed by the hash of its token. */
export const sharedInvitesPath = "sharedInvites";

/** Path of one invite, `sharedInvites/{tokenHash}`. */
export const sharedInvitePath = (tokenHash: string) =>
  `${sharedInvitesPath}/${tokenHash}`;

/** Epoch milliseconds from a Firestore timestamp field, `0` when absent. */
const toMillis = (value: Parameters<typeof readTimestamp>[0]) => {
  const timestamp = readTimestamp(value);
  return timestamp ? new Date(timestamp).getTime() : 0;
};

/**
 * The part of an invite that mirrors the shared copy: what the public preview
 * shows. Written on creation and again whenever the owner re-shares, so the
 * preview never lags behind the document.
 */
const toSnapshotFields = (shared: SharedDocument): FirestoreFields => ({
  name: toStringValue(shared.name),
  ownerEmail: toStringValue(shared.ownerEmail),
  ownerName: toStringValue(shared.ownerName),
  templateId: toStringValue(shared.templateId),
  ...(shared.templateSnapshot
    ? { templateSnapshot: toTemplateSnapshotValue(shared.templateSnapshot) }
    : {}),
  values: toMapValue(
    Object.fromEntries(
      Object.entries(shared.values).map(([key, value]) => [
        key,
        toStringValue(value),
      ]),
    ),
  ),
});

/** Deserialises a `sharedInvites/{tokenHash}` document. */
export const readInvite = (document: FirestoreDocument): SharedInvite => ({
  createdAt: toMillis(document.fields?.createdAt),
  email: readString(document.fields?.email) ?? "",
  expiresAt: toMillis(document.fields?.expiresAt),
  name: readString(document.fields?.name) ?? "",
  ownerEmail: readString(document.fields?.ownerEmail) ?? "",
  ownerId: readString(document.fields?.ownerId) ?? "",
  ownerName: readString(document.fields?.ownerName) ?? "",
  sharedDocumentId: readString(document.fields?.sharedDocumentId) ?? "",
  templateSnapshot: parseTemplateSnapshot(document),
  values: Object.fromEntries(
    Object.entries(readMap(document.fields?.values)).map(([key, value]) => [
      key,
      readString(value) ?? "",
    ]),
  ),
});

/**
 * Creates an invite for `email` on a shared document and returns the raw token
 * for the emailed link. Only the token's hash is stored, so the token exists
 * nowhere but in the email and is lost if the send is.
 *
 * Throws on failure; callers that must not fail (the email side effect) catch it.
 *
 * @param session - Active session of the owner.
 * @param shared - The shared document as just written, for the preview snapshot.
 * @param email - Recipient address; stored normalised.
 * @param now - Epoch milliseconds, for the expiry.
 */
export const createInvite = async (
  session: AuthSession,
  shared: SharedDocument,
  email: string,
  now = Date.now(),
): Promise<InviteToken> => {
  const minted = generateInviteToken();

  await patchFirestoreDocument(
    sharedInvitePath(minted.hash),
    {
      ...toSnapshotFields(shared),
      createdAt: toTimestampValue(new Date(now)),
      email: toStringValue(normaliseEmail(email)),
      expiresAt: toTimestampValue(new Date(now + INVITE_TTL_MS)),
      ownerId: toStringValue(session.user.uid),
      sharedDocumentId: toStringValue(shared.id),
    },
    session.idToken,
  );

  return minted;
};

/**
 * Lists the hashes of the owner's invites for one shared document. Queries on
 * `ownerId` as well as the document, because the rules only let an owner list
 * invites that are provably theirs.
 */
const listInviteHashes = async (
  session: AuthSession,
  sharedDocumentId: string,
): Promise<string[]> => {
  const documents = await runFirestoreQuery(
    sharedInvitesPath,
    [
      {
        field: "ownerId",
        op: "EQUAL",
        value: toStringValue(session.user.uid),
      },
      {
        field: "sharedDocumentId",
        op: "EQUAL",
        value: toStringValue(sharedDocumentId),
      },
    ],
    session.idToken,
  );

  return documents.map(getDocumentId);
};

/** Deletes one invite by its hash, for example one whose email never went out. */
export const deleteInvite = (session: AuthSession, tokenHash: string) =>
  deleteFirestoreDocument(sharedInvitePath(tokenHash), session.idToken);

/**
 * Deletes a shared document's invites, which kills their links at once. Used on
 * revoke, and after a new invite is sent so only the latest link works.
 *
 * @param keepHash - An invite to leave alone, normally the one just created.
 */
export const deleteInvites = async (
  session: AuthSession,
  sharedDocumentId: string,
  keepHash?: string,
): Promise<void> => {
  const hashes = await listInviteHashes(session, sharedDocumentId);

  await Promise.all(
    hashes
      .filter((hash) => hash !== keepHash)
      .map((hash) =>
        deleteFirestoreDocument(sharedInvitePath(hash), session.idToken),
      ),
  );
};

/**
 * Brings every live invite's preview up to date with the shared copy, so a
 * re-share that changed the document does not leave an old preview behind.
 * Expiry, address and target are untouched; the rules forbid changing them.
 *
 * @param sharedDocumentId - The document the owner has just re-shared.
 */
export const refreshInviteSnapshots = async (
  session: AuthSession,
  sharedDocumentId: string,
): Promise<void> => {
  const shared = await getSharedDocument(session, sharedDocumentId);
  if (!shared) return;

  const hashes = await listInviteHashes(session, sharedDocumentId);
  const fields = toSnapshotFields(shared);

  await Promise.all(
    hashes.map((hash) =>
      patchFirestoreDocument(
        sharedInvitePath(hash),
        fields,
        session.idToken,
        Object.keys(fields),
      ),
    ),
  );
};

/** What a token resolves to. */
export type InviteLookup =
  | {
      /** The link works. */
      state: "valid";
      invite: SharedInvite;
    }
  | {
      /** The link was real but is past its 14 days. */
      state: "expired";
    }
  | {
      /** Malformed, never issued, or deleted because the share was revoked or the link replaced. */
      state: "invalid";
    };

/**
 * Resolves an emailed token to its invite, with no sign-in: this is what the
 * public preview page reads. A token of the wrong shape never reaches Firestore.
 *
 * An expired and a deleted invite look different on purpose (the first can be
 * fixed by asking for a new link), but neither reveals anything about the
 * document.
 *
 * @throws When Firestore fails for a reason other than the invite being absent.
 */
export const getInviteByToken = async (
  token: string,
  now = Date.now(),
): Promise<InviteLookup> => {
  if (!isInviteTokenShape(token)) return { state: "invalid" };

  let document: FirestoreDocument | null;
  try {
    document = await getFirestoreDocument(
      sharedInvitePath(hashInviteToken(token)),
    );
  } catch (error) {
    if (error instanceof FirestorePermissionDeniedError) {
      return { state: "invalid" };
    }
    throw error;
  }

  if (!document) return { state: "invalid" };

  const invite = readInvite(document);
  return invite.expiresAt > now
    ? { invite, state: "valid" }
    : { state: "expired" };
};

/** The outcome of `acceptInvite`. */
export type AcceptInviteResult =
  | {
      /** The account now has the document; open it for signing. */
      status: "linked";
      sharedDocumentId: string;
    }
  | {
      /** The invite is for another address. `invitedEmail` is masked. */
      status: "mismatch";
      invitedEmail: string;
    }
  | {
      /** Expired. */
      status: "expired";
    }
  | {
      /** Malformed, replaced, revoked or otherwise no longer usable. */
      status: "invalid";
    };

/**
 * Links the signed-in account to the shared document an invite points at.
 *
 * Holding the link and signing in with the invited address is the proof of
 * ownership the rules accept, so an account whose address was never verified can
 * still receive the document. The account adds only its own uid, and names the
 * invite so the rules can check it.
 *
 * Safe to repeat: an account that can already read the document is reported as
 * linked without writing. The write is not retried on a refusal, which means the
 * invite was revoked or replaced between the lookup and the write.
 *
 * @param session - Active session of the person who opened the link.
 * @param token - The raw token from the URL.
 * @throws When Firestore fails for any other reason.
 */
export const acceptInvite = async (
  session: AuthSession,
  token: string,
): Promise<AcceptInviteResult> => {
  const lookup = await getInviteByToken(token);
  if (lookup.state !== "valid") return { status: lookup.state };

  const { invite } = lookup;
  if (normaliseEmail(session.user.email) !== invite.email) {
    return { invitedEmail: maskEmail(invite.email), status: "mismatch" };
  }

  const existing = await getSharedDocument(session, invite.sharedDocumentId);
  if (existing) {
    return { sharedDocumentId: existing.id, status: "linked" };
  }

  try {
    const written = await appendFirestoreArrayElements(
      sharedDocumentPath(invite.sharedDocumentId),
      "recipientUids",
      [toStringValue(session.user.uid)],
      { acceptedInvite: toStringValue(hashInviteToken(token)) },
      session.idToken,
    );

    return written
      ? { sharedDocumentId: invite.sharedDocumentId, status: "linked" }
      : { status: "invalid" };
  } catch (error) {
    if (error instanceof FirestorePermissionDeniedError) {
      return { status: "invalid" };
    }
    throw error;
  }
};
