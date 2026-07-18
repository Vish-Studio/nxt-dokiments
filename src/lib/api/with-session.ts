import "server-only";

import { getIronSession } from "iron-session";

import { handleApiError } from "@/lib/api/errors";
import { sessionOptions, type SessionData } from "@/lib/session";

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
 * Wraps a Route Handler so it only runs for signed-in users, and gives it a
 * pre-authenticated Firestore session.
 *
 * Resolves the iron-session cookie, returns `401` if `session.user` is missing,
 * and otherwise calls `handler` with the authenticated session as an extra last
 * argument. Also catches anything the handler throws and converts it via
 * `handleApiError`, so individual routes don't need their own `try`/`catch`.
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
      const placeholder = Response.json(null);
      const session = await getIronSession<SessionData>(
        request,
        placeholder,
        sessionOptions,
      );

      if (!session.user) {
        return Response.json({ error: "Unauthorised." }, { status: 401 });
      }

      return await handler(request, context, session as AuthenticatedSession);
    } catch (error) {
      return handleApiError(error);
    }
  };
};
