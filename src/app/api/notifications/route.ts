import { withSession } from "@/lib/api/with-session";
import { getNotificationsSeenAt } from "@/lib/firebase/server-notifications";
import {
  NOTIFICATION_WINDOW_MS,
  serverNotificationSources,
} from "@/lib/notifications/server-sources";
import type { AppNotification } from "@/types/notification";

/**
 * `GET /api/notifications`
 *
 * Aggregates every registered server-side notification source for the signed-in
 * user (see `serverNotificationSources`), newest first. A notification is `read`
 * when it was created at or before the user's last "mark all as read". Sources
 * that fail are skipped so one broken source cannot hide the rest. Client-only
 * notifications (e.g. app updates) never pass through here.
 *
 * @returns `{ notifications: AppNotification[] }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const GET = withSession(async (_request, _context, session) => {
  const now = Date.now();

  const [seenAt, results] = await Promise.all([
    getNotificationsSeenAt(session),
    Promise.allSettled(
      serverNotificationSources.map((source) => source.list({ now, session })),
    ),
  ]);

  const notifications: AppNotification[] = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((item) => now - item.createdAt <= NOTIFICATION_WINDOW_MS)
    .map((item) => ({ ...item, read: item.createdAt <= seenAt }))
    .sort((a, b) => b.createdAt - a.createdAt);

  return Response.json({ notifications });
});
