import { withSuperadmin } from "@/lib/api/with-superadmin";
import { listUserAccounts } from "@/lib/firebase/server-admin";

/**
 * `GET /api/admin/users`
 *
 * Every account, newest first, for the admin Users, Plans and Overview pages.
 *
 * @returns `{ accounts: AdminUserAccount[] }`.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` for anyone but a superadmin.
 * @returns `{ error: string }` with status `503` when Firestore could not be reached.
 */
export const GET = withSuperadmin(async (_request, _context, session) =>
  Response.json({ accounts: await listUserAccounts(session.idToken) }),
);
