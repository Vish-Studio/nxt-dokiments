import { getIronSession } from "iron-session";

import { handleApiError } from "@/lib/api/errors";
import { saveSession } from "@/lib/api/session-cookie";
import { reauthenticateWithFirebase } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import {
  isSessionExpired,
  sessionOptions,
  type SessionData,
} from "@/lib/session";

/**
 * `POST /api/auth/reauthenticate`
 *
 * Re-authenticates the signed-in user with a freshly-entered password, to
 * recover from Firebase's `CREDENTIAL_TOO_OLD_LOGIN_AGAIN` error on sensitive
 * operations (e.g. changing a password). The email is always taken from the
 * current session, never from the request body, so a signed-in user can only
 * ever re-authenticate as themselves.
 *
 * The session cookie is rewritten with the fresh tokens Firebase issues, but
 * the session's 1-day deadline is carried over untouched — this route is a
 * password re-check, not a new sign-in, so it must not extend the session.
 *
 * @returns `{ ok: true }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `400` when the account signs in via
 *   Google — there's no password to verify, so this rejects before calling Firebase.
 * @returns `{ error: string }` with status `400` when the password is incorrect
 *   or Firebase rejects the request for any other reason.
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

    if (probeSession.user.provider === "google") {
      return Response.json(
        {
          error:
            "This account signs in with Google — there is no password to verify.",
        },
        { status: 400 },
      );
    }

    const { password } = (await request.json()) as { password: string };
    const reauthenticated = await reauthenticateWithFirebase(
      probeSession.user.email,
      password,
    );

    const response = Response.json({ ok: true });
    await saveSession(request, response, {
      ...reauthenticated,
      absoluteExpiresAt: probeSession.absoluteExpiresAt,
    });

    return response;
  } catch (error) {
    // Firebase was never reached, so the password wasn't judged either way.
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
