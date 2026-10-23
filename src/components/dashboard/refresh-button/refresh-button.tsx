"use client";

import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

import type { NotificationBellTone } from "@/components/dashboard/notification-bell/notification-bell";
import { toneClasses } from "@/components/dashboard/notification-bell/notification-bell";
import { useRefreshData } from "@/hooks/use-refresh-data";
import { cn } from "@/lib/utils";

export interface RefreshButtonViewProps {
  isCoolingDown?: boolean;
  isRefreshing?: boolean;
  onRefresh: () => void;
  tone?: NotificationBellTone;
}

/** Presentational refresh icon button; `RefreshButton` wires it to live data. */
export const RefreshButtonView = ({
  isCoolingDown = false,
  isRefreshing = false,
  onRefresh,
  tone = "light",
}: RefreshButtonViewProps) => (
  <button
    aria-busy={isRefreshing}
    aria-label="Refresh data"
    className={cn(
      "refresh-button btn btn-circle !size-9 !min-h-9 shrink-0 !px-0",
      toneClasses[tone],
      "disabled:cursor-not-allowed disabled:opacity-50",
    )}
    disabled={isRefreshing || isCoolingDown}
    onClick={onRefresh}
    title={
      isCoolingDown && !isRefreshing ? "Refreshed just now" : "Refresh data"
    }
    type="button"
  >
    <ArrowsClockwiseIcon
      aria-hidden
      className={cn(isRefreshing && "animate-spin")}
      size={15}
      weight="bold"
    />
  </button>
);

/** Header button that refetches the data currently on screen. */
export const RefreshButton = ({ tone }: { tone?: NotificationBellTone }) => {
  const { isCoolingDown, isFetching, refresh } = useRefreshData();

  return (
    <RefreshButtonView
      isCoolingDown={isCoolingDown}
      isRefreshing={isFetching}
      onRefresh={() => void refresh()}
      tone={tone}
    />
  );
};

export default RefreshButton;
