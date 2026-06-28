import { getIronSession } from "iron-session";

import { fetchSavedTemplates, persistSavedTemplates } from "@/lib/firebase/server-templates";
import { sessionOptions, type SessionData } from "@/lib/session";
import type { SavedTemplate } from "@/types/template";

/**
 * `GET /api/templates`
 *
 * Reads the authenticated user's saved templates from their Firestore profile
 * document. Called once per signed-in user by `useSyncSavedTemplates` on mount.
 *
 * @returns A `SavedTemplate[]` array (empty when no templates have been saved yet).
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `500` on Firestore errors.
 */
export const GET = async (request: Request): Promise<Response> => {
  try {
    const response = Response.json([]);
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.user) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }

    const templates = await fetchSavedTemplates(session);
    return Response.json(templates);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load your templates.";
    return Response.json({ error: message }, { status: 500 });
  }
};

/**
 * `POST /api/templates`
 *
 * Overwrites the `savedTemplates` array on the user's Firestore profile with
 * the provided list. The client is responsible for optimistic updates — this
 * endpoint is the persistence layer only.
 *
 * @returns `{ ok: true }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `500` on Firestore errors.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const response = Response.json({ ok: true });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.user) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }

    const { items } = (await request.json()) as { items: SavedTemplate[] };
    await persistSavedTemplates(session, items);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save your template.";
    return Response.json({ error: message }, { status: 500 });
  }
};
