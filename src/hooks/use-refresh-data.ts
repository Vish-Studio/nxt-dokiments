"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { trackEvent } from "@/lib/analytics/track";
import {
  REFRESH_COOLDOWN_MS,
  refreshQueryFilter,
} from "@/lib/query/refresh-filter";
import { useUiStore } from "@/stores/ui-store";

/**
 * Refetches the on-screen user data (documents, clients, saved templates,
 * notifications). Only active queries are refetched and inactive ones are left
 * alone, so unmounted screens cost nothing now or on their next visit. A 401 is
 * handled by the `QueryCache` error handler like any other request.
 */
export const useRefreshData = () => {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching(refreshQueryFilter) > 0;
  const cooldownUntil = useUiStore((state) => state.refreshCooldownUntil);
  const [now, setNow] = useState(() => Date.now());
  const isCoolingDown = cooldownUntil > now;

  useEffect(() => {
    const remaining = cooldownUntil - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), remaining);
    return () => clearTimeout(timer);
  }, [cooldownUntil]);

  const refresh = useCallback(async () => {
    const { refreshCooldownUntil, setRefreshCooldownUntil } =
      useUiStore.getState();
    if (refreshCooldownUntil > Date.now()) return;

    trackEvent("data_refreshed", {});
    // Block further clicks immediately; the cooldown proper starts once settled.
    setRefreshCooldownUntil(Infinity);
    try {
      await queryClient.refetchQueries({
        ...refreshQueryFilter,
        type: "active",
      });
    } finally {
      setNow(Date.now());
      setRefreshCooldownUntil(Date.now() + REFRESH_COOLDOWN_MS);
    }
  }, [queryClient]);

  return { isCoolingDown, isFetching, refresh };
};
