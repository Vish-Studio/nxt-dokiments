import { getIronSession } from "iron-session";

import { reauthenticateWithFirebase } from "@/lib/firebase/server-auth";
import { sessionOptions, type SessionData } from "@/lib/session";

/**
 * `POST /api/auth/reauthenticate`
 *
 * Re-authenticates the signed-in user with a freshly-entered password, to
 * recover from Firebase's `CREDENTIAL_TOO_OLD_LOGIN_AGAIN` error on sensitive
 * operations (e.g. changing a password). The email is always taken from the
 * current session, never from the request body, so a signed-in user can only
 * ever re-authenticate as themselves.
 *
 * The session cookie is rewritten with the fresh tokens Firebase issues, the
 * same as sign-in — this route is a password re-check, not a distinct auth
 * mechanism.
 *
 * @returns `{ ok: true }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `400` when the password is incorrect
 *   or Firebase rejects the request for any other reason.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const probeResponse = Response.json({ ok: true });
    const probeSession = await getIronSession<SessionData>(
      request,
      probeResponse,
      sessionOptions,
    );

    if (!probeSession.user) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }

    const { password } = (await request.json()) as { password: string };
    const reauthenticated = await reauthenticateWithFirebase(
      probeSession.user.email,
      password,
    );

    const response = Response.json({ ok: true });
    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions,
    );
    Object.assign(session, reauthenticated);
    await session.save();

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 400 });
  }
};
