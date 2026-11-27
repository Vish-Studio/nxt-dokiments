"use client";

import { BellIcon, CheckIcon } from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { NotificationGroup } from "@/components/dashboard/notification-group/notification-group";
import { NotificationListSkeleton } from "@/components/dashboard/notification-list-skeleton/notification-list-skeleton";
import { useNotifications } from "@/hooks/notifications/use-notifications";
import { iconSize } from "@/lib/icons";
import { groupNotifications } from "@/lib/notifications/notification-display";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

export type NotificationBellTone = "dark" | "light" | "outline";

export const toneClasses: Record<NotificationBellTone, string> = {
  dark: "!border-none !bg-white/10 !text-white hover:!bg-white/20",
  outline:
    "!border !border-steel-mist !bg-transparent !text-nox-noir hover:!bg-base-200",
  light: "!border-none !bg-white/45 !text-nox-noir hover:!bg-white/65",
};

export type NotificationBellViewProps = {
  /** `dark`/`light` for tinted banners; `outline` on the plain panel background. */
  tone?: NotificationBellTone;
  isLoading?: boolean;
  notifications: AppNotification[];
  /** Epoch milliseconds the ages are measured from; see `NotificationListItem`. */
  now?: number;
  onMarkAllAsRead: () => void;
  unreadCount: number;
};

/**
 * Presentational bell and panel; `NotificationBell` wires it to live data.
 *
 * Desktop opens an anchored popover, phones a bottom sheet (the `Dropdown`
 * `sheetTitle`) that leads with the bell icon. Both hold the same panel: a
 * header with the unread count and "Mark all as read", then the list split into
 * "New" and "Earlier", or a skeleton while loading, or an all-caught-up message.
 */
export const NotificationBellView = ({
  isLoading = false,
  notifications,
  now,
  onMarkAllAsRead,
  tone = "light",
  unreadCount,
}: NotificationBellViewProps) => (
  <Dropdown
    ariaLabel={
      unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
    }
    buttonClassName={cn(
      "relative !size-9 !min-h-9 shrink-0 rounded-full !px-0",
      toneClasses[tone],
    )}
    // The popover is taller and wider than a plain menu: it is a feed.
    menuClassName="w-[24rem] max-w-[calc(100vw-2rem)] max-h-[min(34rem,75dvh)]! p-0"
    // A feed with its own buttons and links, not a list of actions.
    popupRole="dialog"
    sheetIcon={BellIcon}
    sheetTitle="Notifications"
    trigger={
      <>
        <BellIcon
          aria-hidden
          size={iconSize.header}
          weight="bold"
        />
        {unreadCount > 0 ? (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-4 text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </>
    }
  >
    <div className="notification-panel">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-steel-mist/60 bg-base-100 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {/* On phones the sheet's own title says "Notifications". */}
          <p className="hidden font-title text-sm font-bold text-nox-noir sm:block">
            Notifications
          </p>
          {unreadCount > 0 ? (
            <span className="inline-flex h-5 items-center rounded-field bg-golden-harvest px-2 text-xs font-bold text-nox-noir">
              {unreadCount} new
            </span>
          ) : (
            <span className="text-xs text-nox-noir/50 sm:hidden">
              Nothing new
            </span>
          )}
        </div>
        <Button
          className="font-medium!"
          disabled={unreadCount === 0}
          icon={
            <CheckIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
          }
          iconPosition="left"
          onClick={onMarkAllAsRead}
          size="sm"
          variant="ghost"
        >
          Mark all as read
        </Button>
      </div>
      {isLoading && notifications.length === 0 ? (
        <NotificationListSkeleton />
      ) : notifications.length > 0 ? (
        <div className="pb-2">
          {groupNotifications(notifications).map((group) => (
            <NotificationGroup
              group={group}
              key={group.label}
              now={now}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-box bg-base-200 text-nox-noir">
            <BellIcon
              aria-hidden
              size={iconSize.feature}
              weight="bold"
            />
          </span>
          <p className="mt-4 font-title text-sm font-bold text-nox-noir">
            You&apos;re all caught up
          </p>
          <p className="mt-1 max-w-56 text-xs leading-5 text-nox-noir/60">
            New templates, shared documents and signatures will show up here.
          </p>
        </div>
      )}
    </div>
  </Dropdown>
);

/** The notification center bell, connected to every registered source. */
export const NotificationBell = ({ tone }: { tone?: NotificationBellTone }) => {
  const { isLoading, markAllAsRead, notifications, unreadCount } =
    useNotifications();

  return (
    <NotificationBellView
      tone={tone}
      isLoading={isLoading}
      notifications={notifications}
      onMarkAllAsRead={markAllAsRead}
      unreadCount={unreadCount}
    />
  );
};

export default NotificationBell;
