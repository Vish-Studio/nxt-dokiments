import { getIronSession } from "iron-session";

import { handleApiError } from "@/lib/api/errors";
import { destroySession, saveSession } from "@/lib/api/session-cookie";
import { refreshFirebaseSession } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import {
  isDevAuthBypass,
  isSessionExpired,
  REFRESH_SKEW_MS,
  sessionOptions,
  type SessionData,
} from "@/lib/session";

/**
 * `GET /api/auth/me`
 *
 * The client-side session hydration endpoint. Called once on app mount by
 * `AuthProvider` to populate the Zustand auth store without exposing tokens
 * to the browser.
 *
 * The 1-day cap is checked here first, and it wins over any amount of token
 * freshness: once `absoluteExpiresAt` has passed there is nothing to refresh
 * towards, so the session is destroyed rather than renewed.
 *
 * Token refresh logic:
 * - If `expiresAt` is more than `REFRESH_SKEW_MS` away, the existing token is
 *   still valid and the user is returned immediately.
 * - If the token is expiring soon, it is refreshed via the Firebase Secure Token
 *   Service and the cookie is rewritten with the new tokens — keeping the
 *   original `absoluteExpiresAt`, so refreshing never buys extra days.
 * - If Firebase *rejects* the refresh (revoked or expired token), the session is
 *   destroyed and `401` is returned, prompting the client to redirect to sign-in.
 * - If Firebase could not be *reached*, the session is left intact and `503` is
 *   returned. The refresh token is still valid, so signing the user out over a
 *   transient network failure would be a one-way trip; the client retries instead.
 *
 * @returns `{ user: AuthUser }` when a valid session exists.
 * @returns `null` with status `401` when no session cookie is present, the
 *   session has hit its 1-day deadline, or the refresh token has been revoked.
 * @returns `{ error: string }` with status `503` when Firebase is unreachable.
 */
export const GET = async (request: Request): Promise<Response> => {
  const response = Response.json(null, { status: 401 });
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );

  if (isDevAuthBypass()) {
    return Response.json({
      user: session.user ?? {
        displayName: "Dev User",
        email: "dev@dokiments.local",
        provider: "password",
        role: "special",
        uid: "dev-auth-bypass-user",
      },
    });
  }

  if (!session.user) {
    return response;
  }

  // Session has hit its 1-day cap — sign the user out, no refresh attempt
  if (isSessionExpired(session)) {
    const expiredResponse = Response.json(null, { status: 401 });
    await destroySession(request, expiredResponse);
    return expiredResponse;
  }

  // Token is fresh — return user as-is
  if (session.expiresAt > Date.now() + REFRESH_SKEW_MS) {
    return Response.json({ user: session.user });
  }

  // Token is expiring — refresh it and rewrite the cookie
  try {
    const refreshed = await refreshFirebaseSession(session);
    const freshResponse = Response.json({ user: refreshed.user });
    await saveSession(request, freshResponse, {
      ...refreshed,
      absoluteExpiresAt: session.absoluteExpiresAt,
    });
    return freshResponse;
  } catch (error) {
    // Couldn't reach Firebase at all — the refresh token is still perfectly valid, so
    // destroying the session here would log the user out over a network blip, with no
    // way back. Keep the cookie and let the client retry the 503 instead.
    if (error instanceof UpstreamUnavailableError) {
      return handleApiError(error);
    }

    const failedResponse = Response.json(null, { status: 401 });
    await destroySession(request, failedResponse);
    return failedResponse;
  }
};
