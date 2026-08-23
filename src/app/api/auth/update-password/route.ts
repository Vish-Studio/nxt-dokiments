import { getIronSession } from "iron-session";

import { handleApiError } from "@/lib/api/errors";
import { saveSession } from "@/lib/api/session-cookie";
import { updateAccountPassword } from "@/lib/firebase/server-auth";
import { FirebaseReauthRequiredError } from "@/lib/firebase/server-identity";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import {
  isSessionExpired,
  sessionOptions,
  type SessionData,
} from "@/lib/session";

/**
 * `POST /api/auth/update-password`
 *
 * Changes the authenticated user's password via the Firebase Identity Toolkit.
 * Firebase rotates both `idToken` and `refreshToken` on a successful password
 * change, so the session cookie is rewritten with the fresh tokens.
 *
 * Requires an active session cookie. Firebase additionally enforces that the
 * session is not too old — if the user signed in a long time ago, Firebase
 * rejects the request with `CREDENTIAL_TOO_OLD_LOGIN_AGAIN`, surfaced here as
 * `code: "REAUTH_REQUIRED"` so the client can prompt for the current password
 * and retry, instead of just showing a static error.
 *
 * @returns `{ ok: true }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `400` when the account signs in via
 *   Google — there's no password to change, so this rejects before calling Firebase.
 * @returns `{ code: "REAUTH_REQUIRED", error: string }` with status `403` when
 *   the session is too old for this operation.
 * @returns `{ error: string }` with status `400` on any other Firebase error
 *   (e.g. weak password).
 * @returns `{ error: string }` with status `503` when Firebase could not be reached —
 *   not a `403`, since an unreachable service is not a stale-credential problem.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const response = Response.json({ ok: true });
    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions,
    );

    if (!session.user || isSessionExpired(session)) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }

    if (session.user.provider === "google") {
      return Response.json(
        {
          error:
            "This account signs in with Google — there is no password to change.",
        },
        { status: 400 },
      );
    }

    const { password } = (await request.json()) as { password: string };
    const updated = await updateAccountPassword(session, password);
    await saveSession(request, response, {
      ...updated,
      absoluteExpiresAt: session.absoluteExpiresAt,
    });

    return response;
  } catch (error) {
    // Firebase was never reached — the password wasn't changed, and it wasn't refused.
    // In particular this is not a stale-credential problem, so don't prompt for reauth.
    if (error instanceof UpstreamUnavailableError) {
      return handleApiError(error);
    }

    if (error instanceof FirebaseReauthRequiredError) {
      return Response.json(
        { code: "REAUTH_REQUIRED", error: error.message },
        { status: 403 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 400 });
  }
};
