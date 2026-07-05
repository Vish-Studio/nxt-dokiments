import { getIronSession } from "iron-session";

import { signInWithFirebase } from "@/lib/firebase/server-auth";
import { DEV_SESSION, isDevAuthBypass, sessionOptions, type SessionData } from "@/lib/session";

/**
 * `POST /api/auth/sign-in`
 *
 * Authenticates the user with email and password via the Firebase Identity
 * Toolkit, then writes the session payload into an encrypted HttpOnly cookie.
 *
 * The Firebase `idToken` and `refreshToken` are stored in the cookie only —
 * the response body contains only the public `AuthUser` object.
 *
 * @returns `{ user: AuthUser }` on success.
 * @returns `{ error: string }` with status `401` on invalid credentials or any Firebase error.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const { email, password } = (await request.json()) as { email: string; password: string };

    let sessionData: SessionData;

    if (isDevAuthBypass()) {
      sessionData = DEV_SESSION;
    } else {
      sessionData = await signInWithFirebase({ email, password });
    }

    const response = Response.json({ user: sessionData.user });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    Object.assign(session, sessionData);
    await session.save();

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 401 });
  }
};
