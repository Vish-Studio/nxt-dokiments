import "server-only";

import {
  deleteFirestoreDocument,
  getDocumentId,
  getFirestoreDocument,
  listFirestoreCollection,
  patchFirestoreDocument,
  readString,
  readTimestamp,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
  type FirestoreFields,
} from "@/lib/firebase/server-firestore";
import type { AuthSession } from "@/types/auth";
import type { Client, ClientInput } from "@/types/client";

/**
 * Firestore subcollection path for a user's client book.
 *
 * Doc IDs are server-generated rather than derived from the client's data. Unlike
 * `savedTemplates` — whose doc ID *is* the `templateId`, giving it a free idempotent
 * upsert — a client has no natural key: `email` is the only candidate and it's both
 * optional and mutable, so keying on it would turn an email correction into a
 * delete-and-recreate and would collide for two contacts at one shared address.
 */
const clientsPath = (uid: string) => `users/${uid}/clients`;
const clientPath = (uid: string, clientId: string) =>
  `${clientsPath(uid)}/${clientId}`;

/** Generates a Firestore-safe document ID for a new client. */
const makeClientId = () =>
  `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Serialises a client's editable fields into a Firestore field map. */
const toClientFields = (input: ClientInput): FirestoreFields => ({
  address: toStringValue(input.address),
  brn: toStringValue(input.brn),
  companyName: toStringValue(input.companyName),
  email: toStringValue(input.email),
  name: toStringValue(input.name),
  nationalId: toStringValue(input.nationalId),
  phone: toStringValue(input.phone),
});

/**
 * Deserialises a `users/{uid}/clients/{clientId}` document into a `Client`.
 *
 * @param document - Firestore document to parse.
 * @param knownId - The document's ID when the caller already knows it (e.g. right
 *   after a `patchFirestoreDocument` write) — a REST `PATCH` response's `name` field
 *   is not guaranteed present, so `getDocumentId` can't be relied on there.
 */
const parseClient = (
  document: FirestoreDocument,
  knownId?: string,
): Client => {
  const fields = document.fields;

  return {
    address: readString(fields?.address) ?? "",
    brn: readString(fields?.brn) ?? "",
    companyName: readString(fields?.companyName) ?? "",
    createdAt: Date.parse(readTimestamp(fields?.createdAt) ?? "") || 0,
    email: readString(fields?.email) ?? "",
    id: knownId ?? getDocumentId(document),
    name: readString(fields?.name) ?? "",
    nationalId: readString(fields?.nationalId) ?? "",
    phone: readString(fields?.phone) ?? "",
    updatedAt: Date.parse(readTimestamp(fields?.updatedAt) ?? "") || 0,
  };
};

/**
 * Lists the authenticated user's clients, newest first.
 *
 * Sorted here rather than left in Firestore's read order so the list matches what
 * users saw while this data lived in browser storage (newest addition on top), and
 * so no consumer has to re-sort.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @returns The user's clients, most recently created first. Empty for a user who has none.
 * @throws When the Firestore request fails.
 */
export const listClients = async (session: AuthSession): Promise<Client[]> => {
  const documents = await listFirestoreCollection(
    clientsPath(session.user.uid),
    session.idToken,
  );

  return documents
    .map((document) => parseClient(document))
    .sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Creates a new client in the user's book.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param input - The client's details, already validated by the route's Zod schema.
 * @returns The newly created `Client`, including its server-assigned `id`.
 * @throws When the Firestore write fails.
 */
export const createClient = async (
  session: AuthSession,
  input: ClientInput,
): Promise<Client> => {
  const clientId = makeClientId();
  const now = toTimestampValue();

  const document = await patchFirestoreDocument(
    clientPath(session.user.uid, clientId),
    { ...toClientFields(input), createdAt: now, updatedAt: now },
    session.idToken,
  );

  return parseClient(document, clientId);
};

/** Fields that can be changed on an existing client. All optional; `createdAt` and `id` are not editable. */
export type UpdateClientInput = Partial<ClientInput>;

/**
 * Updates a client's details using a field mask, leaving unlisted fields untouched.
 *
 * Reads the document first, for two reasons: Firestore's REST `PATCH` is an upsert,
 * so without this check an update aimed at a `clientId` that never existed would
 * silently *create* a partial client record; and having the pre-write state in hand
 * means the updated `Client` can be composed locally instead of costing a third
 * round trip to re-read what we just wrote.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param clientId - ID of the client to update.
 * @param patch - Partial update; keys with `undefined` values are ignored.
 * @returns The updated `Client`, or `null` when no client with this ID exists for
 *   this user — callers should surface that as a `404`.
 * @throws When the Firestore read or write fails.
 */
export const updateClient = async (
  session: AuthSession,
  clientId: string,
  patch: UpdateClientInput,
): Promise<Client | null> => {
  const path = clientPath(session.user.uid, clientId);

  const existing = await getFirestoreDocument(path, session.idToken);
  if (!existing) {
    return null;
  }

  const updatedAt = new Date();
  const fields: FirestoreFields = { updatedAt: toTimestampValue(updatedAt) };
  const mask = ["updatedAt"];
  const changes: UpdateClientInput = {};

  (Object.keys(patch) as Array<keyof ClientInput>).forEach((key) => {
    const value = patch[key];
    if (value === undefined) return;

    fields[key] = toStringValue(value);
    mask.push(key);
    changes[key] = value;
  });

  await patchFirestoreDocument(path, fields, session.idToken, mask);

  return {
    ...parseClient(existing, clientId),
    ...changes,
    updatedAt: updatedAt.getTime(),
  };
};

/**
 * Deletes a client. Idempotent — deleting one that doesn't exist is not an error.
 *
 * Documents already created for this client are unaffected: the editor copies a
 * client's details into the document's own `values` at fill time rather than
 * holding a live reference, so there is nothing here to cascade.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param clientId - ID of the client to delete.
 * @throws When the Firestore delete fails for a reason other than the document not existing.
 */
export const deleteClient = async (
  session: AuthSession,
  clientId: string,
): Promise<void> => {
  await deleteFirestoreDocument(
    clientPath(session.user.uid, clientId),
    session.idToken,
  );
};
