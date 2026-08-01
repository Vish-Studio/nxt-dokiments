import "server-only";

import { getTemplateById } from "@/lib/firebase/server-catalog";
import {
  deleteFirestoreDocument,
  getDocumentId,
  getFirestoreDocument,
  listFirestoreCollection,
  patchFirestoreDocument,
  readArray,
  readMap,
  readString,
  readTimestamp,
  toArrayValue,
  toMapValue,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
  type FirestoreFields,
} from "@/lib/firebase/server-firestore";
import type { AuthSession } from "@/types/auth";
import type {
  DocumentType,
  TemplateField,
  TemplateSnapshot,
  TemplateStyle,
  UserDocument,
} from "@/types/template";

const documentsPath = (uid: string) => `users/${uid}/documents`;
const documentPath = (uid: string, docId: string) =>
  `${documentsPath(uid)}/${docId}`;

/** Generates a Firestore-safe document ID for a new user document. */
const makeDocumentId = () =>
  `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Serialises a `TemplateField[]` into a Firestore `arrayValue` of field maps. */
const toFieldsValue = (fields: TemplateField[]) =>
  toArrayValue(
    fields.map((field) =>
      toMapValue({
        key: toStringValue(field.key),
        label: toStringValue(field.label),
        ...(field.placeholder
          ? { placeholder: toStringValue(field.placeholder) }
          : {}),
        type: toStringValue(field.type),
      }),
    ),
  );

/** Serialises a `TemplateSnapshot` into a Firestore `mapValue`. */
const toTemplateSnapshotValue = (snapshot: TemplateSnapshot) =>
  toMapValue({
    description: toStringValue(snapshot.description),
    documentType: toStringValue(snapshot.documentType),
    fields: toFieldsValue(snapshot.fields),
    name: toStringValue(snapshot.name),
    style: toMapValue({
      description: toStringValue(snapshot.style.description),
      id: toStringValue(snapshot.style.id),
      name: toStringValue(snapshot.style.name),
      tier: toStringValue(snapshot.style.tier),
    }),
  });

/** Serialises a document's free-form field values into a Firestore `mapValue`. */
const toValuesValue = (values: Record<string, string>) =>
  toMapValue(
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, toStringValue(value)]),
    ),
  );

/** Deserialises a `fields` array field into `TemplateField[]`. */
const parseFields = (fields: FirestoreFields | undefined): TemplateField[] =>
  readArray(fields?.fields).map((value) => {
    const field = readMap(value);
    return {
      key: readString(field.key) ?? "",
      label: readString(field.label) ?? "",
      placeholder: readString(field.placeholder),
      type: (readString(field.type) ?? "text") as TemplateField["type"],
    };
  });

/** Deserialises a `style` map field into a `TemplateStyle`. */
const parseStyle = (fields: FirestoreFields | undefined): TemplateStyle => {
  const style = readMap(fields?.style);
  return {
    description: readString(style.description) ?? "",
    id: (readString(style.id) ?? "classic") as TemplateStyle["id"],
    name: readString(style.name) ?? "",
    tier: (readString(style.tier) ?? "free") as TemplateStyle["tier"],
  };
};

/** Deserialises a `templateSnapshot` map field into a `TemplateSnapshot`, or `undefined` if absent. */
const parseTemplateSnapshot = (
  document: FirestoreDocument,
): TemplateSnapshot | undefined => {
  const snapshotFields = document.fields?.templateSnapshot;
  if (!snapshotFields) return undefined;

  const snapshot = readMap(snapshotFields);
  return {
    description: readString(snapshot.description) ?? "",
    documentType: (readString(snapshot.documentType) ??
      "contract") as DocumentType,
    fields: parseFields(snapshot),
    name: readString(snapshot.name) ?? "",
    style: parseStyle(snapshot),
  };
};

/** Deserialises a `values` map field into a plain `Record<string, string>`. */
const parseValues = (
  fields: FirestoreFields | undefined,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(readMap(fields?.values)).map(([key, value]) => [
      key,
      readString(value) ?? "",
    ]),
  );

/**
 * Deserialises a `users/{uid}/documents/{docId}` document into a `UserDocument`.
 *
 * @param document - Firestore document to parse.
 * @param knownId - The document's ID, when already known by the caller (e.g. right
 *   after a `patchFirestoreDocument` write) — used instead of `getDocumentId(document)`,
 *   since a REST `PATCH` response's `name` field is not guaranteed present in every case.
 */
const parseUserDocument = (
  document: FirestoreDocument,
  knownId?: string,
): UserDocument => {
  const fields = document.fields;

  return {
    createdAt: Date.parse(readTimestamp(fields?.createdAt) ?? "") || 0,
    id: knownId ?? getDocumentId(document),
    name: readString(fields?.name) ?? "",
    templateId: readString(fields?.templateId) ?? "",
    templateSnapshot: parseTemplateSnapshot(document),
    updatedAt: Date.parse(readTimestamp(fields?.updatedAt) ?? "") || 0,
    values: parseValues(fields),
  };
};

/**
 * Lists the authenticated user's documents, optionally filtered by `templateId`.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param templateId - When provided, only documents created from this template are returned.
 * @returns The user's documents, in server-returned order.
 * @throws When the Firestore request fails.
 */
export const listDocuments = async (
  session: AuthSession,
  templateId?: string,
): Promise<UserDocument[]> => {
  const documents = await listFirestoreCollection(
    documentsPath(session.user.uid),
    session.idToken,
  );
  const parsed = documents.map((document) => parseUserDocument(document));
  return templateId
    ? parsed.filter((document) => document.templateId === templateId)
    : parsed;
};

/**
 * Fetches a single document by ID.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param documentId - ID of the document to fetch.
 * @returns The `UserDocument`, or `null` if it doesn't exist (or belongs to another user —
 *   the path is always scoped to `session.user.uid`, so "doesn't exist" and "not owned" are
 *   indistinguishable by design).
 * @throws When the Firestore request fails for a reason other than a 404.
 */
export const getDocument = async (
  session: AuthSession,
  documentId: string,
): Promise<UserDocument | null> => {
  const document = await getFirestoreDocument(
    documentPath(session.user.uid, documentId),
    session.idToken,
  );
  return document ? parseUserDocument(document) : null;
};

/** Fields required to create a new document. */
export type CreateDocumentInput = {
  name: string;
  templateId: string;
  values: Record<string, string>;
};

/**
 * Creates a new document from a template, snapshotting the template's current
 * `name`, `style`, and `fields` onto the document so later catalog edits or
 * deactivation cannot retroactively change or break it.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param input - Document name, the template to create it from, and its field values.
 * @returns The newly created `UserDocument`, or `null` when `input.templateId` does not
 *   resolve to an active template — callers should surface this as a 404.
 * @throws When the Firestore write fails.
 */
export const createDocument = async (
  session: AuthSession,
  input: CreateDocumentInput,
): Promise<UserDocument | null> => {
  const template = await getTemplateById(input.templateId, session.idToken);
  if (!template) {
    return null;
  }

  const documentId = makeDocumentId();
  const now = toTimestampValue();
  const snapshot: TemplateSnapshot = {
    description: template.description,
    documentType: template.documentType,
    fields: template.fields,
    name: template.name,
    style: template.style,
  };

  const fields: FirestoreFields = {
    createdAt: now,
    name: toStringValue(input.name),
    templateId: toStringValue(input.templateId),
    templateSnapshot: toTemplateSnapshotValue(snapshot),
    updatedAt: now,
    values: toValuesValue(input.values),
  };

  const document = await patchFirestoreDocument(
    documentPath(session.user.uid, documentId),
    fields,
    session.idToken,
  );
  return parseUserDocument(document, documentId);
};

/** Fields that can be updated on an existing document. */
export type UpdateDocumentInput = {
  name?: string;
  values?: Record<string, string>;
};

/**
 * Updates a document's `name` and/or `values` using a field mask. Never touches
 * `templateSnapshot` or `templateId` — those are immutable after creation.
 *
 * Re-fetches the full document after writing, since Firestore's REST `PATCH`
 * response with an `updateMask` only echoes back the masked fields — parsing
 * that response directly would silently lose `templateId`/`templateSnapshot`/`createdAt`.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param documentId - ID of the document to update.
 * @param patch - Partial update; at least one of `name`/`values` should be provided by the caller.
 * @returns The updated `UserDocument`.
 * @throws When the Firestore write fails, or the re-fetch afterwards fails.
 */
export const updateDocument = async (
  session: AuthSession,
  documentId: string,
  patch: UpdateDocumentInput,
): Promise<UserDocument> => {
  const fields: FirestoreFields = { updatedAt: toTimestampValue() };
  const mask = ["updatedAt"];

  if (patch.name !== undefined) {
    fields.name = toStringValue(patch.name);
    mask.push("name");
  }
  if (patch.values !== undefined) {
    fields.values = toValuesValue(patch.values);
    mask.push("values");
  }

  const path = documentPath(session.user.uid, documentId);
  await patchFirestoreDocument(path, fields, session.idToken, mask);

  const updated = await getFirestoreDocument(path, session.idToken);
  if (!updated) {
    throw new Error("Document not found after update.");
  }

  return parseUserDocument(updated, documentId);
};

/**
 * Deletes a document. Idempotent — deleting a document that doesn't exist is not an error.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param documentId - ID of the document to delete.
 * @throws When the Firestore delete fails for a reason other than the document not existing.
 */
export const deleteDocument = async (
  session: AuthSession,
  documentId: string,
): Promise<void> => {
  await deleteFirestoreDocument(
    documentPath(session.user.uid, documentId),
    session.idToken,
  );
};
