import "server-only";

import { getIronSession } from "iron-session";

import { ApiError, handleApiError } from "@/lib/api/errors";
import { destroySession, saveSession } from "@/lib/api/session-cookie";
import { refreshFirebaseSession } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import {
  DEV_SESSION,
  isDevAuthBypass,
  isSessionExpired,
  REFRESH_SKEW_MS,
  sessionOptions,
  type SessionData,
} from "@/lib/session";

/** Session guaranteed to have an authenticated `user`, as narrowed by `withSession`. */
export type AuthenticatedSession = SessionData & {
  user: NonNullable<SessionData["user"]>;
};

/**
 * A Next.js Route Handler function, as exported from a `route.ts` file
 * (e.g. `export const GET = ...`). `TContext` covers the second `{ params }`
 * argument Next.js passes to dynamic routes.
 */
type RouteHandler<TContext> = (
  request: Request,
  context: TContext,
) => Promise<Response>;

/**
 * Refreshes currently in progress, keyed by the refresh token being exchanged.
 * Per server process only; it is not shared across instances.
 */
const inFlightRefreshes = new Map<
  string,
  ReturnType<typeof refreshFirebaseSession>
>();

/**
 * Exchanges the session's Firebase refresh token for fresh tokens, making sure
 * concurrent requests carrying the same refresh token share a single exchange.
 *
 * A dashboard load fires several API calls at once; without this each one would
 * hit Firebase's token endpoint, and if Firebase ever rotated the refresh token
 * the losers would be signed out with a token that was just replaced.
 *
 * @param session - Session whose `idToken` has expired or is about to.
 * @returns The refreshed tokens and profile. The entry is dropped once the
 *   exchange settles, so a failed refresh is retried on the next request.
 * @throws `UpstreamUnavailableError` if Firebase can't be reached, or another
 *   error if Firebase rejects the refresh token.
 */
const refreshOnce = (session: SessionData) => {
  const existing = inFlightRefreshes.get(session.refreshToken);

  if (existing) {
    return existing;
  }

  const pending = refreshFirebaseSession(session).finally(() =>
    inFlightRefreshes.delete(session.refreshToken),
  );
  inFlightRefreshes.set(session.refreshToken, pending);

  return pending;
};

/**
 * Wraps a Route Handler so it only runs for signed-in users, and gives it a
 * pre-authenticated Firestore session.
 *
 * Resolves the iron-session cookie, returns `401` if `session.user` is missing
 * or the session has passed its 1-day deadline, and otherwise calls `handler`
 * with the authenticated session as an extra last argument. Also catches
 * anything the handler throws and converts it via `handleApiError`, so
 * individual routes don't need their own `try`/`catch`.
 *
 * The expiry check matters beyond tidiness: without it an expired session would
 * still reach Firestore with a dead `idToken`, and the resulting provider error
 * would surface as an opaque `500` instead of the `401` that tells the client to
 * sign in again.
 * For expected failure cases inside `handler`, throw `ApiError` and rely on the
 * examples in `src/lib/api/errors.ts` for status/message patterns.
 *
 * `TContext` should match the second argument Next.js passes to your route
 * handler (for example `{ params: { id: string } }` on dynamic routes).
 *
 * @example
 * export const GET = withSession(async (_request, _context, session) => {
 *   return Response.json({ userId: session.user.id });
 * });
 *
 * @example
 * type Context = { params: Promise<{ documentId: string }> };
 *
 * export const DELETE = withSession<Context>(async (_request, context, session) => {
 *   const { documentId } = await context.params;
 *
 *   if (!documentId.startsWith(session.user.id)) {
 *     throw new ApiError(403, "Forbidden.");
 *   }
 *
 *   return Response.json({ ok: true });
 * });
 *
 * @param handler - Route logic to run once a session is confirmed. Receives the
 *   same `(request, context)` Next.js would normally pass, plus the resolved
 *   `AuthenticatedSession` as a third argument.
 * @returns A standard Route Handler suitable for `export const GET = withSession(...)`.
 */
export const withSession = <TContext = unknown>(
  handler: (
    request: Request,
    context: TContext,
    session: AuthenticatedSession,
  ) => Promise<Response>,
): RouteHandler<TContext> => {
  return async (request, context) => {
    try {
      // Bound to the 401 we may return rather than a throwaway response, so
      // that clearing an expired session's cookies actually reaches the browser.
      const unauthorised = Response.json(
        { error: "Unauthorised." },
        { status: 401 },
      );
      const session = await getIronSession<SessionData>(
        request,
        unauthorised,
        sessionOptions,
      );

      // A bypass cookie is only usable while the bypass is on; otherwise its
      // placeholder token would be sent to Firestore and rejected.
      const isStaleBypass =
        session.idToken === DEV_SESSION.idToken && !isDevAuthBypass();

      if (!session.user || isSessionExpired(session) || isStaleBypass) {
        if (process.env.NODE_ENV === "development") {
          const reason = !session.user
            ? "no session cookie/user"
            : isStaleBypass
              ? "stale dev-bypass cookie"
              : "session past its 1-day deadline";
          console.warn(
            `[withSession] 401 ${request.method} ${new URL(request.url).pathname}: ${reason}`,
          );
        }

        await destroySession(request, unauthorised);
        return unauthorised;
      }

      // The idToken lasts ~1h but the session lasts a day, so renew it here
      // instead of letting Firestore reject it and signing the user out.
      if (!isStaleBypass && session.expiresAt <= Date.now() + REFRESH_SKEW_MS) {
        let refreshed: Awaited<ReturnType<typeof refreshFirebaseSession>>;

        try {
          refreshed = await refreshOnce(session);
        } catch (error) {
          // Firebase unreachable: keep the session; the client can retry the 503.
          // Any other failure means the refresh token was rejected, so sign out.
          if (error instanceof UpstreamUnavailableError) {
            throw error;
          }

          throw new ApiError(401, "Unauthorised.");
        }

        // Carry the deadline over explicitly: a refresh must never extend the 1-day cap.
        const rotated: SessionData = {
          ...refreshed,
          absoluteExpiresAt: session.absoluteExpiresAt,
        };
        // The handler builds its own Response, so the rewritten cookie is
        // sealed on a stand-in and its Set-Cookie headers copied across below.
        const cookieCarrier = new Response(null);
        await saveSession(request, cookieCarrier, rotated);

        // The handler must see the new idToken, not the expired one from the cookie.
        const result = await handler(request, context, {
          ...rotated,
        } as AuthenticatedSession);

        for (const cookie of cookieCarrier.headers.getSetCookie()) {
          result.headers.append("Set-Cookie", cookie);
        }

        return result;
      }

      return await handler(request, context, session as AuthenticatedSession);
    } catch (error) {
      // The provider rejected the session's token: clear it so the client re-authenticates.
      if (error instanceof ApiError && error.status === 401) {
        const unauthorised = Response.json(
          { error: error.message },
          { status: 401 },
        );
        await destroySession(request, unauthorised);
        return unauthorised;
      }

      return handleApiError(error);
    }
  };
};
