import "server-only";

import {
  deleteFirestoreDocument,
  getDocumentId,
  listFirestoreCollection,
  patchFirestoreDocument,
  readInteger,
  toIntegerValue,
  type FirestoreDocument,
} from "@/lib/firebase/server-firestore";
import type { AuthSession } from "@/types/auth";
import type { SavedTemplate } from "@/types/template";

/**
 * Firestore subcollection path for a user's saved templates.
 * Doc ID is the templateId itself, so saving is an idempotent upsert and
 * removing is a single-document delete — no read-modify-write of a shared list.
 */
const savedTemplatesPath = (uid: string) => `users/${uid}/savedTemplates`;
const savedTemplatePath = (uid: string, templateId: string) =>
  `${savedTemplatesPath(uid)}/${templateId}`;

/**
 * Deserialises a `users/{uid}/savedTemplates/{templateId}` document into a `SavedTemplate`.
 *
 * @param document - Firestore document fetched from the subcollection.
 * @returns The `SavedTemplate`, with `templateId`/`savedId` taken from the document's own ID.
 */
const parseSavedTemplate = (document: FirestoreDocument): SavedTemplate => {
  const templateId = getDocumentId(document);
  return {
    savedAt: readInteger(document.fields?.savedAt) ?? 0,
    savedId: templateId,
    templateId,
  };
};

/**
 * Lists the authenticated user's saved templates.
 *
 * Returns an empty array for a user who hasn't saved any yet — there is nothing
 * to create in advance, unlike the old whole-array-on-the-profile-document model.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @returns The user's saved templates, in server-returned order.
 * @throws When the Firestore request fails.
 */
export const listSavedTemplates = async (
  session: AuthSession,
): Promise<SavedTemplate[]> => {
  const documents = await listFirestoreCollection(
    savedTemplatesPath(session.user.uid),
    session.idToken,
  );
  return documents.map(parseSavedTemplate);
};

/**
 * Saves one template to the user's library. Idempotent — saving an already-saved
 * `templateId` overwrites its `savedAt` rather than creating a duplicate or erroring.
 *
 * Callers are responsible for any tier/limit checks before calling this — this
 * function performs the write unconditionally.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param templateId - ID of the marketplace template to save.
 * @returns The saved template's record.
 * @throws When the Firestore write fails.
 */
export const saveTemplate = async (
  session: AuthSession,
  templateId: string,
): Promise<SavedTemplate> => {
  const savedAt = Date.now();

  await patchFirestoreDocument(
    savedTemplatePath(session.user.uid, templateId),
    { savedAt: toIntegerValue(savedAt) },
    session.idToken,
  );

  return { savedAt, savedId: templateId, templateId };
};

/**
 * Removes one template from the user's library.
 * Idempotent — removing a `templateId` that was never saved is not an error.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param templateId - ID of the template to remove.
 * @throws When the Firestore delete fails for a reason other than the document not existing.
 */
export const removeSavedTemplate = async (
  session: AuthSession,
  templateId: string,
): Promise<void> => {
  await deleteFirestoreDocument(
    savedTemplatePath(session.user.uid, templateId),
    session.idToken,
  );
};
