import "server-only";

import { sendNotification } from "web-push";

import {
  deletePushSubscription,
  listPushSubscriptions,
} from "@/lib/firebase/server-push-subscriptions";
import { getPushConfig, hasPushConfig } from "@/lib/push/config";
import { pushNotificationsEnabled } from "@/lib/push/feature-flag";
import type { AuthSession } from "@/types/auth";
import type { PushPayload } from "@/types/push";

/**
 * How a {@link sendPushToUser} call went.
 *
 * - `ok: true`: `sent` devices accepted the push (it can be `0` when the user
 *   has no devices subscribed, which is not a failure) and `removed` expired
 *   subscriptions were cleaned up.
 * - `ok: false`: nothing was attempted (`reason: "disabled"`, the flag is off or
 *   the VAPID keys are missing) or the device list could not be read
 *   (`reason: "error"`).
 */
export type SendPushResult =
  | { ok: true; sent: number; removed: number }
  | { ok: false; reason: "disabled" | "error" };

/** The push service says this subscription is gone for good (unsubscribed or expired). */
const isGone = (error: unknown): boolean => {
  const status = (error as { statusCode?: number } | null)?.statusCode;
  return status === 404 || status === 410;
};

/**
 * Sends one push to every device the signed-in user has subscribed.
 *
 * This is the only module that talks to the push services, so features never
 * import `web-push` directly. It never throws: a failed push must not fail the
 * request that triggered it. Subscriptions the push service reports as gone
 * (`404`/`410`) are deleted so they are not retried forever; any other
 * per-device failure is logged without the endpoint, which is a bearer secret
 * for that device.
 *
 * It sends to the **session's own** user because subscriptions are readable
 * only by their owner under `firestore.rules`.
 *
 * @example
 * after(async () => {
 *   const result = await sendPushToUser(session, {
 *     body: "Invoice 12 was signed",
 *     title: "Document signed",
 *     url: "/my-documents",
 *   });
 *   if (!result.ok) console.error("[push] not sent", result.reason);
 * });
 */
export const sendPushToUser = async (
  session: AuthSession,
  payload: PushPayload,
): Promise<SendPushResult> => {
  if (!pushNotificationsEnabled || !hasPushConfig()) {
    return { ok: false, reason: "disabled" };
  }

  const { privateKey, publicKey, subject } = getPushConfig();

  try {
    const subscriptions = await listPushSubscriptions(session);
    const body = JSON.stringify(payload);
    let sent = 0;
    let removed = 0;

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await sendNotification(
            { endpoint: subscription.endpoint, keys: subscription.keys },
            body,
            {
              TTL: 60 * 60 * 24,
              vapidDetails: { privateKey, publicKey, subject },
            },
          );
          sent += 1;
        } catch (error) {
          if (isGone(error)) {
            await deletePushSubscription(session, subscription.endpoint).catch(
              () => undefined,
            );
            removed += 1;
            return;
          }

          const status = (error as { statusCode?: number } | null)?.statusCode;
          console.error(
            `[push] send failed${status ? ` (status ${status})` : ""}`,
          );
        }
      }),
    );

    return { ok: true, removed, sent };
  } catch (error) {
    console.error(
      `[push] could not load subscriptions: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return { ok: false, reason: "error" };
  }
};
