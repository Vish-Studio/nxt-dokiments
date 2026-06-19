import { firebaseConfig } from "@/lib/firebase/config";
import type { AuthSession } from "@/types/auth";
import type { SavedTemplate } from "@/types/template";

type FirestoreValue = {
  arrayValue?: { values?: FirestoreValue[] };
  integerValue?: string;
  mapValue?: { fields?: Record<string, FirestoreValue> };
  stringValue?: string;
};

type FirestoreDocument = {
  error?: { message?: string };
  fields?: Record<string, FirestoreValue>;
};

const userDocumentUrl = (uid: string) =>
  `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}`;

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

/** Read the user's saved (owned) templates from their Firestore profile. */
export const fetchSavedTemplates = async (session: AuthSession): Promise<SavedTemplate[]> => {
  const response = await fetch(userDocumentUrl(session.user.uid), {
    headers: { Authorization: `Bearer ${session.idToken}` },
  });

  if (response.status === 404) {
    return [];
  }

  const document = (await response.json().catch(() => null)) as FirestoreDocument | null;

  if (!response.ok) {
    throw new Error(document?.error?.message || "Unable to load your templates.");
  }

  return parseSavedTemplates(document);
};

/** Persist the user's saved templates as an array field on their profile. */
export const persistSavedTemplates = async (
  session: AuthSession,
  items: SavedTemplate[],
): Promise<void> => {
  const url = `${userDocumentUrl(
    session.user.uid,
  )}?updateMask.fieldPaths=savedTemplates&updateMask.fieldPaths=updatedAt`;

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
