import { handleApiError } from "@/lib/api/errors";
import { startSession } from "@/lib/api/session-cookie";
import { signInWithFirebase } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import { DEV_SESSION, isDevAuthBypass } from "@/lib/session";
import type { AuthSession } from "@/types/auth";

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
 * @returns `{ error: string }` with status `503` when Firebase could not be reached —
 *   deliberately not a `401`, since unreachable says nothing about the credentials.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    let sessionData: AuthSession;

    if (isDevAuthBypass()) {
      sessionData = DEV_SESSION;
    } else {
      sessionData = await signInWithFirebase({ email, password });
    }

    const response = Response.json({ user: sessionData.user });
    await startSession(request, response, sessionData);

    return response;
  } catch (error) {
    // Firebase was never reached, so this says nothing about the credentials. Reporting
    // it as 401 would tell the user their password is wrong during a network outage.
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
