import { startSession } from "@/lib/api/session-cookie";
import { signUpWithFirebase } from "@/lib/firebase/server-auth";
import { DEV_SESSION, isDevAuthBypass } from "@/lib/session";
import type { AuthSession } from "@/types/auth";

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

    let sessionData: AuthSession;

    if (isDevAuthBypass()) {
      sessionData = DEV_SESSION;
    } else {
      sessionData = await signUpWithFirebase({ displayName, email, password });
    }

    const response = Response.json({ user: sessionData.user });
    await startSession(request, response, sessionData);

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 401 });
  }
};
