import { withSession } from "@/lib/api/with-session";
import { parseBody } from "@/lib/api/validate";
import {
  SubscribePushSchema,
  UnsubscribePushSchema,
} from "@/lib/api/push-schema";
import {
  deletePushSubscription,
  savePushSubscription,
} from "@/lib/firebase/server-push-subscriptions";
import { assertPushNotificationsAvailable } from "@/lib/push/server-guard";

/**
 * `POST /api/push/subscriptions`
 *
 * Stores this browser's push subscription for the signed-in user. Idempotent:
 * subscribing the same device again updates its record instead of adding one.
 *
 * @returns `{ ok: true }` with status `201`.
 * @returns `{ error: string }` with status `400` for a malformed subscription.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` while push notifications are off.
 * @returns `{ error: string }` with status `503` when the VAPID keys are missing.
 */
export const POST = withSession(async (request, _context, session) => {
  assertPushNotificationsAvailable();

  const subscription = await parseBody(request, SubscribePushSchema);
  await savePushSubscription(session, subscription);

  return Response.json({ ok: true }, { status: 201 });
});

/**
 * `DELETE /api/push/subscriptions`
 *
 * Removes this browser's subscription (the user opted out, or is signing out).
 * Idempotent: removing a subscription that is already gone still succeeds.
 *
 * @returns `{ ok: true }` with status `200`.
 * @returns `{ error: string }` with status `400` for a malformed body.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` while push notifications are off.
 */
export const DELETE = withSession(async (request, _context, session) => {
  // No availability check, so a user can always opt out, even if the flag is
  // turned off or the keys are removed after they subscribed.
  const { endpoint } = await parseBody(request, UnsubscribePushSchema);
  await deletePushSubscription(session, endpoint);

  return Response.json({ ok: true });
});
