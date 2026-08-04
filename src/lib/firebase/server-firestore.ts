import "server-only";

import { serverFirebaseConfig } from "@/lib/firebase/server-config";

/** Recursive Firestore REST value union used when reading and writing document fields. */
export type FirestoreValue =
  | {
      /** Nested list of Firestore values. Absent means an empty array. */
      arrayValue: { values?: FirestoreValue[] };
    }
  | {
      /** Plain boolean value. */
      booleanValue: boolean;
    }
  | {
      /** Firestore encodes integers as decimal strings, not JSON numbers. */
      integerValue: string;
    }
  | {
      /** Nested field map. Absent means an empty map. */
      mapValue: { fields?: Record<string, FirestoreValue> };
    }
  | {
      /** Plain UTF-8 string value. */
      stringValue: string;
    }
  | {
      /** ISO 8601 timestamp string, e.g. `2026-07-18T00:00:00.000Z`. */
      timestampValue: string;
    };

/** Firestore REST field map, keyed by field name. */
export type FirestoreFields = Record<string, FirestoreValue>;

/** Minimal shape of a Firestore REST document response. */
export type FirestoreDocument = {
  /** The document's field values, keyed by field name. Absent on a brand-new, still-empty document. */
  fields?: FirestoreFields;
  /** Full resource path (e.g. `projects/{id}/databases/(default)/documents/users/{uid}`), not a display name. */
  name?: string;
};

/** Shape of a Firestore REST error response body. */
type FirestoreErrorBody = {
  /** Details of the failed request, when the response was not 2xx. */
  error?: {
    /** Human-readable error message returned by the Firestore REST API. */
    message?: string;
  };
};

const FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1";

/** Builds the Firestore REST URL for a document path, e.g. `users/{uid}`. */
const documentUrl = (path: string) =>
  `${FIRESTORE_BASE_URL}/projects/${serverFirebaseConfig.projectId}/databases/(default)/documents/${path}`;

/** Shape of a Firestore REST `documents:list` response page. */
type FirestoreListResponse = {
  /** Documents on this page. Absent (not `[]`) when the collection is empty. */
  documents?: FirestoreDocument[];
  /** Opaque token for fetching the next page, or absent on the last page. */
  nextPageToken?: string;
};

/**
 * Extracts a document's ID from its full resource `name` path
 * (`.../documents/{collection}/{docId}` → `{docId}`).
 *
 * @param document - A document as returned by any Firestore REST read.
 * @returns The document's ID, or `""` if `name` is absent.
 */
export const getDocumentId = (document: FirestoreDocument): string =>
  document.name?.split("/").pop() ?? "";

/**
 * Lists every document in a Firestore collection via the REST API, transparently
 * paging through `nextPageToken` until the full collection has been fetched.
 *
 * @param collectionPath - Collection path relative to the database root, e.g. `templates`.
 * @param idToken - Firebase ID token used to authorise the request.
 * @returns All documents in the collection, in server-returned order.
 * @throws When any page of the request fails.
 */
export const listFirestoreCollection = async (
  collectionPath: string,
  idToken: string,
): Promise<FirestoreDocument[]> => {
  const documents: FirestoreDocument[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(documentUrl(collectionPath));
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    const page = (await response.json().catch(() => null)) as
      | (FirestoreListResponse & FirestoreErrorBody)
      | null;

    if (!response.ok) {
      throw new Error(
        page?.error?.message || "Unable to list the requested collection.",
      );
    }

    documents.push(...(page?.documents ?? []));
    pageToken = page?.nextPageToken;
  } while (pageToken);

  return documents;
};

/**
 * Reads a Firestore document via the REST API, authorised with the caller's own ID token.
 *
 * @param path - Document path relative to the database root, e.g. `users/{uid}`.
 * @param idToken - Firebase ID token used to authorise the request (Firestore Security Rules
 *   are evaluated against this token's `uid` claim, not a service-account credential).
 * @returns The parsed document, or `null` when it does not exist (404).
 * @throws When the request fails for any reason other than a 404.
 */
export const getFirestoreDocument = async (
  path: string,
  idToken: string,
): Promise<FirestoreDocument | null> => {
  const response = await fetch(documentUrl(path), {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (response.status === 404) return null;

  const document = (await response.json().catch(() => null)) as
    | (FirestoreDocument & FirestoreErrorBody)
    | null;

  if (!response.ok) {
    throw new Error(
      document?.error?.message || "Unable to read the requested document.",
    );
  }

  return document;
};

/**
 * Creates or updates a Firestore document via the REST API.
 *
 * @param path - Document path relative to the database root, e.g. `users/{uid}`.
 * @param fields - Complete set of fields to write.
 * @param idToken - Firebase ID token used to authorise the request.
 * @param fieldMask - When provided, restricts the write to only these field paths, leaving all
 *   other existing fields on the document untouched. Omit to overwrite the whole document
 *   (only safe when the document is known not to exist yet, e.g. first-time creation).
 * @throws When the Firestore PATCH request fails.
 */
export const patchFirestoreDocument = async (
  path: string,
  fields: FirestoreFields,
  idToken: string,
  fieldMask?: string[],
): Promise<FirestoreDocument> => {
  const mask = fieldMask?.length
    ? `?${fieldMask.map((field) => `updateMask.fieldPaths=${field}`).join("&")}`
    : "";

  const response = await fetch(`${documentUrl(path)}${mask}`, {
    body: JSON.stringify({ fields }),
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  const document = (await response.json().catch(() => null)) as
    | (FirestoreDocument & FirestoreErrorBody)
    | null;

  if (!response.ok) {
    throw new Error(
      document?.error?.message || "Unable to write the requested document.",
    );
  }

  return document as FirestoreDocument;
};

/**
 * Deletes a Firestore document via the REST API. Idempotent — a document that does not exist
 * is treated as a successful delete rather than an error.
 *
 * @param path - Document path relative to the database root.
 * @param idToken - Firebase ID token used to authorise the request.
 * @throws When the request fails for any reason other than a 404.
 */
export const deleteFirestoreDocument = async (
  path: string,
  idToken: string,
): Promise<void> => {
  const response = await fetch(documentUrl(path), {
    headers: { Authorization: `Bearer ${idToken}` },
    method: "DELETE",
  });

  if (!response.ok && response.status !== 404) {
    const document = (await response
      .json()
      .catch(() => null)) as FirestoreErrorBody | null;
    throw new Error(
      document?.error?.message || "Unable to delete the requested document.",
    );
  }
};

/** Wraps a plain boolean as a Firestore REST `booleanValue` field. */
export const toBooleanValue = (value: boolean): FirestoreValue => ({
  booleanValue: value,
});

/** Wraps a plain string as a Firestore REST `stringValue` field. */
export const toStringValue = (value: string): FirestoreValue => ({
  stringValue: value,
});

/** Wraps a `Date` (defaulting to now) as a Firestore REST `timestampValue` field. */
export const toTimestampValue = (date: Date = new Date()): FirestoreValue => ({
  timestampValue: date.toISOString(),
});

/** Wraps a number as a Firestore REST `integerValue` field (Firestore encodes integers as strings). */
export const toIntegerValue = (value: number): FirestoreValue => ({
  integerValue: String(value),
});

/** Wraps a list of Firestore values as an `arrayValue` field. */
export const toArrayValue = (values: FirestoreValue[]): FirestoreValue => ({
  arrayValue: { values },
});

/** Wraps a field map as a nested Firestore `mapValue` field. */
export const toMapValue = (fields: FirestoreFields): FirestoreValue => ({
  mapValue: { fields },
});

/** Reads a `booleanValue` field, or `undefined` if the value is absent or a different variant. */
export const readBoolean = (
  value: FirestoreValue | undefined,
): boolean | undefined =>
  value && "booleanValue" in value ? value.booleanValue : undefined;

/** Reads a `stringValue` field, or `undefined` if the value is absent or a different variant. */
export const readString = (
  value: FirestoreValue | undefined,
): string | undefined =>
  value && "stringValue" in value ? value.stringValue : undefined;

/** Reads a `timestampValue` field as its raw ISO 8601 string, or `undefined` if absent. */
export const readTimestamp = (
  value: FirestoreValue | undefined,
): string | undefined =>
  value && "timestampValue" in value ? value.timestampValue : undefined;

/** Reads an `integerValue` field as a `number`, or `undefined` if absent. */
export const readInteger = (
  value: FirestoreValue | undefined,
): number | undefined =>
  value && "integerValue" in value ? Number(value.integerValue) : undefined;

/** Reads an `arrayValue` field's values, or `[]` if absent. */
export const readArray = (
  value: FirestoreValue | undefined,
): FirestoreValue[] =>
  value && "arrayValue" in value ? (value.arrayValue.values ?? []) : [];

/** Reads a `mapValue` field's nested fields, or `{}` if absent. */
export const readMap = (value: FirestoreValue | undefined): FirestoreFields =>
  value && "mapValue" in value ? (value.mapValue.fields ?? {}) : {};
