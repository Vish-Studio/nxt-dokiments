import "server-only";

import {
  getFirestoreDocument,
  patchFirestoreDocument,
  readArray,
  readInteger,
  readMap,
  readString,
  toArrayValue,
  toIntegerValue,
  toMapValue,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
} from "@/lib/firebase/server-firestore";
import type { AuthSession } from "@/types/auth";
import type { SavedTemplate } from "@/types/template";

/** Firestore document path for a user's profile document (where `savedTemplates` lives). */
const userProfilePath = (uid: string) => `users/${uid}`;

/**
 * Deserialises the `savedTemplates` array field from a Firestore document.
 * Items with an empty `templateId` are filtered out to guard against partial writes.
 *
 * @param document - Firestore document fetched from `users/{uid}`, or `null` if it doesn't exist.
 * @returns The user's saved templates, or `[]` when the document is `null` or has no saves.
 */
const parseSavedTemplates = (
  document: FirestoreDocument | null,
): SavedTemplate[] =>
  readArray(document?.fields?.savedTemplates)
    .map((value): SavedTemplate => {
      const fields = readMap(value);
      const templateId = readString(fields.templateId) ?? "";
      return {
        savedAt: readInteger(fields.savedAt) ?? 0,
        savedId: templateId,
        templateId,
      };
    })
    .filter((item) => item.templateId);

/**
 * Reads the authenticated user's saved templates from their Firestore profile document.
 *
 * Returns an empty array when the document does not yet exist (new users).
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @returns The user's saved templates, or `[]` for a user who hasn't saved any yet.
 * @throws When the Firestore request fails for any reason other than a 404.
 */
export const fetchSavedTemplates = async (
  session: AuthSession,
): Promise<SavedTemplate[]> => {
  const document = await getFirestoreDocument(
    userProfilePath(session.user.uid),
    session.idToken,
  );
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
  const savedTemplates = toArrayValue(
    items.map((item) =>
      toMapValue({
        savedAt: toIntegerValue(item.savedAt),
        templateId: toStringValue(item.templateId),
      }),
    ),
  );

  await patchFirestoreDocument(
    userProfilePath(session.user.uid),
    { savedTemplates, updatedAt: toTimestampValue() },
    session.idToken,
    ["savedTemplates", "updatedAt"],
  );
};
