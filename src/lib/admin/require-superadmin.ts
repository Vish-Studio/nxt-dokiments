import "server-only";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { isSuperadmin } from "@/lib/admin/access";
import { isSessionExpired, sessionOptions, type SessionData } from "@/lib/session";

/**
 * Stops anyone but a superadmin from seeing an `/admin` page.
 *
 * Call it at the top of **every** admin `page.tsx`, not once in a layout: a
 * layout is not re-rendered on client-side navigation, so a guard there would
 * miss pages reached by clicking a link. It answers with `notFound()` rather
 * than a redirect or 403, so the portal's routes give nothing away to a
 * customer who guesses the URL.
 *
 * It only reads the session cookie. A server component cannot rewrite that
 * cookie, so it never refreshes tokens and never loads data; the data comes
 * from `/api/admin` routes, which check the role again against Firestore
 * (`withSuperadmin`).
 *
 * @throws The `notFound()` signal when there is no session, it has passed its
 *   one-day deadline, or the account is not a superadmin.
 *
 * @example
 * const AdminUsersPage = async () => {
 *   await requireSuperadmin();
 *   return <AdminShell activeItem="Users" title="Users"><AdminUsersView /></AdminShell>;
 * };
 */
export const requireSuperadmin = async (): Promise<void> => {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.user || isSessionExpired(session) || !isSuperadmin(session.user)) {
    notFound();
  }
};
