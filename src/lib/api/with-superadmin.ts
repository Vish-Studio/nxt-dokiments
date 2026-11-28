import "server-only";

import { isSuperadmin } from "@/lib/admin/access";
import { ApiError } from "@/lib/api/errors";
import { type AuthenticatedSession, withSession } from "@/lib/api/with-session";
import { getFirestoreDocument, readString } from "@/lib/firebase/server-firestore";

/**
 * Wraps an `/api/admin` Route Handler so only a superadmin can call it.
 *
 * Builds on `withSession` (sign-in, expiry, token refresh, error handling),
 * then re-reads the caller's role from `users/{uid}` instead of trusting the
 * copy in the session cookie, which can be up to an hour old: an
 * administrator whose role was removed loses access on their next request.
 *
 * Refuses with `404`, not `403`, so the admin API does not confirm it exists
 * to a customer who probes it. `firestore.rules` still checks the role on every
 * read, as the second gate.
 *
 * @example
 * export const GET = withSuperadmin(async (_request, _context, session) =>
 *   Response.json({ accounts: await listUserAccounts(session.idToken) }),
 * );
 *
 * @param handler - Route logic, called with the same arguments as `withSession` gives.
 * @returns A Route Handler for `export const GET = withSuperadmin(...)`.
 */
export const withSuperadmin = <TContext = unknown>(
  handler: (
    request: Request,
    context: TContext,
    session: AuthenticatedSession,
  ) => Promise<Response>,
) =>
  withSession<TContext>(async (request, context, session) => {
    if (!isSuperadmin(session.user)) {
      throw new ApiError(404, "Not found.");
    }

    const profile = await getFirestoreDocument(`users/${session.user.uid}`, session.idToken);
    const role = readString(profile?.fields?.role);

    if (role !== "superadmin") {
      throw new ApiError(404, "Not found.");
    }

    return handler(request, context, session);
  });
