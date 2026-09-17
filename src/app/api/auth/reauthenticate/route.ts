import { getIronSession } from "iron-session";

import { ReauthenticateSchema } from "@/lib/api/auth-schema";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { saveSession } from "@/lib/api/session-cookie";
import { parseBody } from "@/lib/api/validate";
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
 * @returns `{ error: string }` with status `400` when the body fails validation.
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

    // Validated after the gates above, so a caller with no session learns nothing
    // about the expected body shape. `ReauthenticateSchema` puts no maximum on the
    // password: it is verifying a credential that already exists, and a ceiling here
    // would leave the owner of a long password unable to confirm it (see
    // `credentialFieldLimits`).
    const { password } = await parseBody(request, ReauthenticateSchema);
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
    // Neither of these means the password was wrong, which is what the 400 below
    // reports. A rejected body is a 400 with a sanitized message of its own; an
    // unreachable Firebase is a 503, since the password wasn't judged either way.
    if (
      error instanceof ApiError ||
      error instanceof UpstreamUnavailableError
    ) {
      return handleApiError(error);
    }

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 400 });
  }
};
