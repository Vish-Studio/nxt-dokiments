import { withSuperadmin } from "@/lib/api/with-superadmin";
import { getSystemStatus } from "@/lib/firebase/server-admin";

/**
 * `GET /api/admin/system`
 *
 * Feature switches, configuration checks (presence only, never values), the
 * running version and the administrators, for the admin System page.
 *
 * @returns `{ system: AdminSystemStatus }`.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` for anyone but a superadmin.
 */
export const GET = withSuperadmin(async (_request, _context, session) =>
  Response.json({ system: await getSystemStatus(session.idToken) }),
);
