"use client";

import { PushNotificationCard } from "@/components/dashboard/push-notification-card/push-notification-card";
import {
  PushPermissionDismissedError,
  usePushNotifications,
} from "@/hooks/use-push-notifications";
import { useToastStore } from "@/stores/toast-store";

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/**
 * Settings → Notifications: wires {@link PushNotificationCard} to the browser
 * and the push API, and reports each outcome as a toast.
 *
 * Dismissing the browser's permission prompt is deliberately silent. The user
 * made a choice, and an error toast would read as the app having failed.
 */
export const PushNotificationSettings = () => {
  const push = usePushNotifications();
  const showToast = useToastStore((state) => state.showToast);

  return (
    <PushNotificationCard
      isDisabling={push.isDisabling}
      isEnabling={push.isEnabling}
      isSendingTest={push.isSendingTest}
      onDisable={() =>
        push
          .disable()
          .then(() =>
            showToast({
              message: "Notifications turned off on this device.",
              tone: "success",
            }),
          )
          .catch((error: unknown) =>
            showToast({
              message: messageOf(error, "Unable to turn notifications off."),
              tone: "error",
            }),
          )
      }
      onEnable={() =>
        push
          .enable()
          .then(() =>
            showToast({
              message: "Notifications turned on for this device.",
              tone: "success",
            }),
          )
          .catch((error: unknown) => {
            if (error instanceof PushPermissionDismissedError) return;
            showToast({
              message: messageOf(error, "Unable to turn notifications on."),
              tone: "error",
            });
          })
      }
      onSendTest={() =>
        push
          .sendTest()
          .then(() =>
            showToast({
              message: "Test notification sent.",
              tone: "success",
            }),
          )
          .catch((error: unknown) =>
            showToast({
              message: messageOf(error, "Unable to send a test notification."),
              tone: "error",
            }),
          )
      }
      status={push.status}
    />
  );
};
