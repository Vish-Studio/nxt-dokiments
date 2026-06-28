import "server-only";

import { serverFirebaseConfig } from "@/lib/firebase/server-config";
import type { AuthSession } from "@/types/auth";
import type { SavedTemplate } from "@/types/template";

/** Recursive Firestore REST value union used when parsing document fields. */
type FirestoreValue = {
  arrayValue?: { values?: FirestoreValue[] };
  integerValue?: string;
  mapValue?: { fields?: Record<string, FirestoreValue> };
  stringValue?: string;
};

/** Minimal shape of a Firestore REST document response. */
type FirestoreDocument = {
  error?: { message?: string };
  fields?: Record<string, FirestoreValue>;
};

/** Builds the Firestore REST URL for a user's profile document. */
const userDocumentUrl = (uid: string) =>
  `https://firestore.googleapis.com/v1/projects/${serverFirebaseConfig.projectId}/databases/(default)/documents/users/${uid}`;

/**
 * Serialises a `SavedTemplate` array to the Firestore REST wire format.
 * Only `savedAt` and `templateId` are persisted; `savedId` is a client-side alias.
 */
const toFirestoreArray = (items: SavedTemplate[]): FirestoreValue => ({
  arrayValue: {
    values: items.map((item) => ({
      mapValue: {
        fields: {
          savedAt: { integerValue: String(item.savedAt) },
          templateId: { stringValue: item.templateId },
        },
      },
    })),
  },
});

/**
 * Deserialises the `savedTemplates` array field from a Firestore document.
 * Items with an empty `templateId` are filtered out to guard against partial writes.
 */
const parseSavedTemplates = (document: FirestoreDocument | null): SavedTemplate[] => {
  const values = document?.fields?.savedTemplates?.arrayValue?.values ?? [];

  return values
    .map((value): SavedTemplate => {
      const fields = value.mapValue?.fields ?? {};
      const templateId = fields.templateId?.stringValue ?? "";
      return { savedAt: Number(fields.savedAt?.integerValue ?? 0), savedId: templateId, templateId };
    })
    .filter((item) => item.templateId);
};

/**
 * Reads the authenticated user's saved templates from their Firestore profile document.
 *
 * Returns an empty array when the document does not yet exist (new users).
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @throws When the Firestore request fails for any reason other than a 404.
 */
export const fetchSavedTemplates = async (session: AuthSession): Promise<SavedTemplate[]> => {
  const response = await fetch(userDocumentUrl(session.user.uid), {
    headers: { Authorization: `Bearer ${session.idToken}` },
  });

  if (response.status === 404) return [];

  const document = (await response.json().catch(() => null)) as FirestoreDocument | null;

  if (!response.ok) {
    throw new Error(document?.error?.message || "Unable to load your templates.");
  }

  return parseSavedTemplates(document);
};

/**
 * Overwrites the `savedTemplates` array field on the user's Firestore profile document.
 *
 * Uses a field mask so only `savedTemplates` and `updatedAt` are touched — other
 * profile fields (displayName, role, etc.) are left unchanged.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param items - The complete updated list of saved templates to persist.
 * @throws When the Firestore PATCH request fails.
 */
export const persistSavedTemplates = async (
  session: AuthSession,
  items: SavedTemplate[],
): Promise<void> => {
  const url = `${userDocumentUrl(session.user.uid)}?updateMask.fieldPaths=savedTemplates&updateMask.fieldPaths=updatedAt`;

  const response = await fetch(url, {
    body: JSON.stringify({
      fields: {
        savedTemplates: toFirestoreArray(items),
        updatedAt: { timestampValue: new Date().toISOString() },
      },
    }),
    headers: {
      Authorization: `Bearer ${session.idToken}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    const document = (await response.json().catch(() => null)) as FirestoreDocument | null;
    throw new Error(document?.error?.message || "Unable to save your template.");
  }
};
