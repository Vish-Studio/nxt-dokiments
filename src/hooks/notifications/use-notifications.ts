"use client";

import { useMemo } from "react";

import { useAppUpdateNotifications } from "@/hooks/notifications/use-app-update-notifications";
import {
  useMarkNotificationsReadMutation,
  useServerNotificationsQuery,
} from "@/hooks/queries/use-notifications";

/**
 * The notification center's single data source: every producer merged into one
 * newest-first list.
 *
 * **To plug in a new kind of notification**, write a hook that returns
 * `AppNotification[]` (or add a server source — see `docs/notifications.md`) and
 * call it in `sources` below. Nothing else changes.
 */
export const useNotifications = () => {
  const serverQuery = useServerNotificationsQuery();
  const markRead = useMarkNotificationsReadMutation();
  const appUpdate = useAppUpdateNotifications();

  const serverNotifications = serverQuery.data;

  const notifications = useMemo(
    () =>
      [...(serverNotifications ?? []), ...appUpdate].sort(
        (a, b) => b.createdAt - a.createdAt,
      ),
    [serverNotifications, appUpdate],
  );

  return {
    isLoading: serverQuery.isLoading,
    markAllAsRead: () => {
      if (serverNotifications?.some((item) => !item.read)) {
        markRead.mutate();
      }
    },
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
  };
};
