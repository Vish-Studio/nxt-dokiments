import { z } from "zod";

import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import {
  fetchSavedTemplates,
  persistSavedTemplates,
} from "@/lib/firebase/server-saved-templates";

const PersistSavedTemplatesSchema = z.object({
  items: z.array(
    z.object({
      savedAt: z.number(),
      savedId: z.string().min(1),
      templateId: z.string().min(1),
    }),
  ),
});

/**
 * `GET /api/saved-templates`
 *
 * Reads the authenticated user's saved templates from their Firestore profile
 * document. Called once per signed-in user by `useSyncSavedTemplates` on mount.
 *
 * @returns A `SavedTemplate[]` array (empty when no templates have been saved yet).
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `500` on Firestore errors.
 */
export const GET = withSession(async (_request, _context, session) => {
  const templates = await fetchSavedTemplates(session);
  return Response.json(templates);
});

/**
 * `POST /api/saved-templates`
 *
 * Overwrites the `savedTemplates` array on the user's Firestore profile with
 * the provided list. The client is responsible for optimistic updates — this
 * endpoint is the persistence layer only.
 *
 * This whole-array-overwrite storage model is superseded by a
 * `users/{uid}/savedTemplates/{templateId}` subcollection in Phase 2 — kept as-is
 * here so relocating this route off `/api/templates` doesn't also change behaviour.
 *
 * @returns `{ ok: true }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `400` when the request body is malformed.
 * @returns `{ error: string }` with status `500` on Firestore errors.
 */
export const POST = withSession(async (request, _context, session) => {
  const { items } = await parseBody(request, PersistSavedTemplatesSchema);
  await persistSavedTemplates(session, items);
  return Response.json({ ok: true });
});
