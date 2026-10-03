import { withSession } from "@/lib/api/with-session";
import { markNotificationsSeen } from "@/lib/firebase/server-notifications";

/**
 * `POST /api/notifications/read`
 *
 * Marks every server-produced notification up to now as read for the signed-in
 * user. Idempotent.
 *
 * @returns `{ lastSeenAt: number }` (epoch ms) on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const POST = withSession(async (_request, _context, session) => {
  const lastSeenAt = await markNotificationsSeen(session);
  return Response.json({ lastSeenAt });
});
