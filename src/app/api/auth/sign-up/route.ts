import { getIronSession } from "iron-session";

import { signUpWithFirebase } from "@/lib/firebase/server-auth";
import { DEV_SESSION, isDevAuthBypass, sessionOptions, type SessionData } from "@/lib/session";

/**
 * `POST /api/auth/sign-up`
 *
 * Creates a new Firebase account, seeds a Firestore user profile with
 * `role: "free"`, then writes the session payload into an encrypted HttpOnly cookie.
 *
 * @returns `{ user: AuthUser }` on success.
 * @returns `{ error: string }` with status `401` when the email is already in use,
 *   the password is too weak, or any other Firebase error occurs.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const { displayName, email, password } = (await request.json()) as {
      displayName: string;
      email: string;
      password: string;
    };

    let sessionData: SessionData;

    if (isDevAuthBypass()) {
      sessionData = DEV_SESSION;
    } else {
      sessionData = await signUpWithFirebase({ displayName, email, password });
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
