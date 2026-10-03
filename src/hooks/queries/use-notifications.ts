import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import type {
  AppNotification,
  NotificationsResponse,
} from "@/types/notification";

const fetchNotifications = async (): Promise<AppNotification[]> => {
  const response = await fetch("/api/notifications");

  if (!response.ok) {
    throw new Error("Unable to load notifications.");
  }

  return ((await response.json()) as NotificationsResponse).notifications;
};

/**
 * Server-produced notifications, refreshed every minute and when the tab regains
 * focus. Polling is paused in background tabs (TanStack's default).
 */
export const useServerNotificationsQuery = () =>
  useQuery({
    queryFn: fetchNotifications,
    queryKey: queryKeys.notifications.all(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

const postMarkRead = async (): Promise<void> => {
  const response = await fetch("/api/notifications/read", { method: "POST" });

  if (!response.ok) {
    throw new Error("Unable to mark notifications as read.");
  }
};

/** Marks every server-produced notification as read, optimistically. */
export const useMarkNotificationsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postMarkRead,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.all(),
      });
      const previous = queryClient.getQueryData<AppNotification[]>(
        queryKeys.notifications.all(),
      );
      queryClient.setQueryData<AppNotification[]>(
        queryKeys.notifications.all(),
        (current) => current?.map((item) => ({ ...item, read: true })),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(
        queryKeys.notifications.all(),
        context?.previous,
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });
};
