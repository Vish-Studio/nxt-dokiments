import { getIronSession } from "iron-session";

import { updateAccountProfile, type ProfileUpdate } from "@/lib/firebase/server-auth";
import { sessionOptions, type SessionData } from "@/lib/session";

/**
 * `POST /api/auth/update-profile`
 *
 * Updates the authenticated user's display name on the Firebase Auth account
 * and their extended profile fields (address, company, etc.) on the Firestore
 * document. The session cookie is rewritten with any fresh tokens Firebase
 * issues, and the response body includes the updated `AuthUser` so the client
 * can refresh the Zustand store immediately without a separate `GET /api/auth/me`.
 *
 * @returns `{ user: AuthUser }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `400` on Firebase or Firestore errors.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const probeResponse = Response.json({ ok: true });
    const probeSession = await getIronSession<SessionData>(request, probeResponse, sessionOptions);

    if (!probeSession.user) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }

    const profile = (await request.json()) as ProfileUpdate;
    const updated = await updateAccountProfile(probeSession, profile);

    const response = Response.json({ user: updated.user });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    Object.assign(session, updated);
    await session.save();

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 400 });
  }
};
