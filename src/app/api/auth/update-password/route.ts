import { getIronSession } from "iron-session";

import { updateAccountPassword } from "@/lib/firebase/server-auth";
import { FirebaseReauthRequiredError } from "@/lib/firebase/server-identity";
import { sessionOptions, type SessionData } from "@/lib/session";

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
 * @returns `{ code: "REAUTH_REQUIRED", error: string }` with status `403` when
 *   the session is too old for this operation.
 * @returns `{ error: string }` with status `400` on any other Firebase error
 *   (e.g. weak password).
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const response = Response.json({ ok: true });
    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions,
    );

    if (!session.user) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }

    const { password } = (await request.json()) as { password: string };
    const updated = await updateAccountPassword(session, password);
    Object.assign(session, updated);
    await session.save();

    return response;
  } catch (error) {
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
