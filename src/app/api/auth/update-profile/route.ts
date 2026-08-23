import { getIronSession } from "iron-session";

import { handleApiError } from "@/lib/api/errors";
import { saveSession } from "@/lib/api/session-cookie";
import {
  updateAccountProfile,
  type ProfileUpdate,
} from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import {
  isSessionExpired,
  sessionOptions,
  type SessionData,
} from "@/lib/session";

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
 * @returns `{ error: string }` with status `503` when Firebase could not be reached.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const probeResponse = Response.json({ ok: true });
    const probeSession = await getIronSession<SessionData>(
      request,
      probeResponse,
      sessionOptions,
    );

    if (!probeSession.user || isSessionExpired(probeSession)) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }

    const profile = (await request.json()) as ProfileUpdate;
    const updated = await updateAccountProfile(probeSession, profile);

    const response = Response.json({ user: updated.user });
    await saveSession(request, response, {
      ...updated,
      absoluteExpiresAt: probeSession.absoluteExpiresAt,
    });

    return response;
  } catch (error) {
    // Firebase was never reached — nothing was saved, and nothing was rejected.
    if (error instanceof UpstreamUnavailableError) {
      return handleApiError(error);
    }

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 400 });
  }
};
