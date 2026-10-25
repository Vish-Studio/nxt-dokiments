import { getIronSession } from "iron-session";

import { handleApiError } from "@/lib/api/errors";
import { destroySession, saveSession } from "@/lib/api/session-cookie";
import { refreshFirebaseSession } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import {
  isDevAuthBypass,
  isSessionExpired,
  sessionOptions,
  type SessionData,
} from "@/lib/session";

/**
 * `POST /api/auth/refresh-verification`
 *
 * Forces a token refresh so a user who has just clicked the verification link sees
 * the change straight away. The ID token's `email_verified` claim only updates when
 * a new token is minted, and the normal refresh waits until the old one is about to
 * expire — up to an hour later.
 *
 * Backs the "I've verified" action. The response carries the refreshed `AuthUser`,
 * whose `emailVerified` is `false` if the link has not been clicked yet.
 *
 * **Session handling is hand-rolled rather than using `withSession`, deliberately.**
 * `withSession` may rotate the cookie itself when the token is nearly expired, and
 * appends that cookie after the handler's own, so the older tokens would win and
 * undo this refresh. The same reasoning applies to `update-profile`. Failure
 * semantics mirror `GET /api/auth/me`.
 *
 * @returns `{ user: AuthUser }` on success.
 * @returns `{ error: string }` with status `401` when no session is present, the
 *   session has reached its 1-day deadline, or Firebase rejected the refresh token.
 * @returns `{ error: string }` with status `503` when Firebase could not be
 *   reached; the session is kept so the client can retry.
 */
export const POST = async (request: Request): Promise<Response> => {
  const probeResponse = Response.json({ ok: true });
  const session = await getIronSession<SessionData>(
    request,
    probeResponse,
    sessionOptions,
  );

  if (!session.user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  if (isDevAuthBypass()) {
    return Response.json({ user: session.user });
  }

  if (isSessionExpired(session)) {
    const expired = Response.json({ error: "Unauthorised." }, { status: 401 });
    await destroySession(request, expired);
    return expired;
  }

  try {
    const refreshed = await refreshFirebaseSession(session);
    const response = Response.json({ user: refreshed.user });
    await saveSession(request, response, {
      ...refreshed,
      absoluteExpiresAt: session.absoluteExpiresAt,
    });
    return response;
  } catch (error) {
    // The refresh token is still valid when Firebase merely couldn't be reached.
    if (error instanceof UpstreamUnavailableError) {
      return handleApiError(error);
    }

    const rejected = Response.json({ error: "Unauthorised." }, { status: 401 });
    await destroySession(request, rejected);
    return rejected;
  }
};
