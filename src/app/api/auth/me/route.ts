import { getIronSession } from "iron-session";

import { refreshFirebaseSession } from "@/lib/firebase/server-auth";
import { isDevAuthBypass, REFRESH_SKEW_MS, sessionOptions, type SessionData } from "@/lib/session";

/**
 * `GET /api/auth/me`
 *
 * The client-side session hydration endpoint. Called once on app mount by
 * `AuthProvider` to populate the Zustand auth store without exposing tokens
 * to the browser.
 *
 * Token refresh logic:
 * - If `expiresAt` is more than `REFRESH_SKEW_MS` away, the existing token is
 *   still valid and the user is returned immediately.
 * - If the token is expiring soon, it is refreshed via the Firebase Secure Token
 *   Service and the cookie is rewritten with the new tokens.
 * - If the refresh fails (revoked token, network error), the session is destroyed
 *   and `401` is returned, prompting the client to redirect to sign-in.
 *
 * @returns `{ user: AuthUser }` when a valid session exists.
 * @returns `null` with status `401` when no session cookie is present or the
 *   refresh token has been revoked.
 */
export const GET = async (request: Request): Promise<Response> => {
  const response = Response.json(null, { status: 401 });
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (isDevAuthBypass()) {
    return Response.json({ user: session.user ?? { displayName: "Dev User", email: "dev@dokiments.local", role: "special", uid: "dev-auth-bypass-user" } });
  }

  if (!session.user) {
    return response;
  }

  // Token is fresh — return user as-is
  if (session.expiresAt > Date.now() + REFRESH_SKEW_MS) {
    return Response.json({ user: session.user });
  }

  // Token is expiring — refresh it and rewrite the cookie
  try {
    const refreshed = await refreshFirebaseSession(session);
    const freshResponse = Response.json({ user: refreshed.user });
    const freshSession = await getIronSession<SessionData>(request, freshResponse, sessionOptions);
    Object.assign(freshSession, refreshed);
    await freshSession.save();
    return freshResponse;
  } catch {
    session.destroy();
    return Response.json(null, { status: 401 });
  }
};
