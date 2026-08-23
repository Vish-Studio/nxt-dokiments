import { handleApiError } from "@/lib/api/errors";
import { startSession } from "@/lib/api/session-cookie";
import { signUpWithFirebase } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
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
 * @returns `{ error: string }` with status `503` when Firebase could not be reached.
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
    // Firebase was never reached — the email isn't taken and the password isn't weak,
    // so don't report a network outage as a rejected sign-up.
    if (error instanceof UpstreamUnavailableError) {
      return handleApiError(error);
    }

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 401 });
  }
};
