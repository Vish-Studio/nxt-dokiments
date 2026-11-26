import { ApiError } from "@/lib/api/errors";
import { withSession } from "@/lib/api/with-session";
import { assertPushNotificationsAvailable } from "@/lib/push/server-guard";
import { sendPushToUser } from "@/lib/push/send-push";

/**
 * `POST /api/push/test`
 *
 * Sends a test notification to every device the signed-in user has subscribed,
 * so they can confirm push works before any real event depends on it. Sent
 * inline (not in `after()`) because the caller wants to know whether it landed.
 *
 * @returns `{ sent: number }` with status `200`, the number of devices the push
 *   services accepted it for.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` while push notifications are off.
 * @returns `{ error: string }` with status `409` when no device is subscribed
 *   (or every subscription had expired).
 * @returns `{ error: string }` with status `503` when the VAPID keys are missing
 *   or the subscriptions could not be read.
 */
export const POST = withSession(async (_request, _context, session) => {
  assertPushNotificationsAvailable();

  const result = await sendPushToUser(session, {
    body: "Push notifications are working on this device.",
    tag: "push-test",
    title: "Dokiments test notification",
    url: "/settings",
  });

  if (!result.ok) {
    throw new ApiError(
      503,
      "We couldn't send a test notification. Please try again.",
    );
  }

  if (result.sent === 0) {
    throw new ApiError(
      409,
      "No device is subscribed. Turn notifications on first.",
    );
  }

  return Response.json({ sent: result.sent });
});
