"use client";

import { useMemo } from "react";

import { useAppUpdateStore } from "@/stores/app-update-store";
import type { AppNotification } from "@/types/notification";

/**
 * Client-only source: one persistent notification while a new build is waiting.
 * It never touches the server and clears itself once the update is applied.
 */
export const useAppUpdateNotifications = (): AppNotification[] => {
  const accept = useAppUpdateStore((state) => state.accept);
  const isWaiting = useAppUpdateStore((state) => state.isWaiting);
  const waitingSince = useAppUpdateStore((state) => state.waitingSince);

  return useMemo(
    () =>
      isWaiting && accept && waitingSince
        ? [
            {
              action: { label: "Update now", onClick: accept },
              body: "A new version of Dokiments is ready. Reloading will take unsaved changes with it.",
              createdAt: waitingSince,
              id: "app-update",
              kind: "app-update",
              persistent: true,
              read: false,
              title: "Update available",
            },
          ]
        : [],
    [accept, isWaiting, waitingSince],
  );
};
