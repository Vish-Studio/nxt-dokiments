"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  ArrowsClockwiseIcon,
  BellIcon,
  FilePlusIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import { Button } from "@/components/commons/button/button";
import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { useNotifications } from "@/hooks/notifications/use-notifications";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

/** Icon per notification `kind`; unknown kinds fall back to a generic one. */
const kindIcons: Record<string, Icon> = {
  "app-update": ArrowsClockwiseIcon,
  template: FilePlusIcon,
};

export type NotificationBellTone = "dark" | "light" | "outline";

const toneClasses: Record<NotificationBellTone, string> = {
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
  onMarkAllAsRead: () => void;
  unreadCount: number;
};

const formatAge = (createdAt: number, now = Date.now()) => {
  const minutes = Math.max(0, Math.floor((now - createdAt) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const NotificationRow = ({
  notification,
}: {
  notification: AppNotification;
}) => {
  const KindIcon = kindIcons[notification.kind] ?? InfoIcon;
  const { action } = notification;

  return (
    <li
      className={cn(
        "flex gap-3 rounded-field px-3 py-3",
        !notification.read && "bg-base-200",
      )}
    >
      <KindIcon
        aria-hidden
        className="mt-0.5 shrink-0"
        size={18}
        weight="bold"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {notification.title}
          {!notification.read ? (
            <span className="sr-only"> (unread)</span>
          ) : null}
        </p>
        {notification.body ? (
          <p className="mt-0.5 text-xs text-nox-noir/70">{notification.body}</p>
        ) : null}
        <div className="mt-1 flex items-center gap-3 text-xs text-nox-noir/50">
          <span>{formatAge(notification.createdAt)}</span>
          {action?.href ? (
            <Link
              className="font-semibold text-nox-noir underline"
              href={action.href}
            >
              {action.label}
            </Link>
          ) : action?.onClick ? (
            <button
              className="font-semibold text-nox-noir underline"
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
};

/** Presentational bell + dropdown; `NotificationBell` wires it to live data. */
export const NotificationBellView = ({
  isLoading = false,
  notifications,
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
    menuClassName="w-80 max-w-[calc(100vw-2rem)] p-0"
    trigger={
      <>
        <BellIcon
          aria-hidden
          size={15}
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
    <div className="flex items-center justify-between border-b border-steel-mist/50 px-3 py-2">
      <p className="font-title text-sm font-semibold">Notifications</p>
      <Button
        className="font-medium!"
        disabled={unreadCount === 0}
        onClick={onMarkAllAsRead}
        size="sm"
        variant="ghost"
      >
        Mark all as read
      </Button>
    </div>
    {notifications.length > 0 ? (
      <ul className="flex flex-col gap-1 p-2">
        {notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
          />
        ))}
      </ul>
    ) : (
      <p className="px-3 py-8 text-center text-sm text-nox-noir/60">
        {isLoading ? "Loading…" : "You're all caught up."}
      </p>
    )}
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
