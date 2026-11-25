/**
 * Master switch for web push notifications. Off unless
 * `NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED` is exactly `"true"`, so the whole
 * feature can ship dark and be switched on once the VAPID keys are in place.
 *
 * Like `NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED`, this is inlined into the client
 * bundle at build time, so flipping it needs a rebuild and redeploy. Server
 * routes and client components read the same constant, so they cannot disagree.
 */
export const pushNotificationsEnabled =
  process.env.NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED === "true";
