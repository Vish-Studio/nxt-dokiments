import { ApiError } from "@/lib/api/errors";
import { withSuperadmin } from "@/lib/api/with-superadmin";
import { getUserDetail } from "@/lib/firebase/server-admin";

type Context = { params: Promise<{ uid: string }> };

/** Firebase UIDs are 1–128 URL-safe characters; anything else never reaches Firestore. */
const UID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

/**
 * `GET /api/admin/users/{uid}`
 *
 * One account's profile and the feedback it sent, for the admin user page.
 *
 * @returns `{ user: AdminUserDetail }`.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` for anyone but a superadmin,
 *   for a malformed UID, or when no account has that UID.
 */
export const GET = withSuperadmin<Context>(async (_request, context, session) => {
  const { uid } = await context.params;

  if (!UID_PATTERN.test(uid)) {
    throw new ApiError(404, "Account not found.");
  }

  const user = await getUserDetail(uid, session);

  if (!user) {
    throw new ApiError(404, "Account not found.");
  }

  return Response.json({ user });
});
