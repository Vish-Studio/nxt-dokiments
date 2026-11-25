import type { AppNotification } from "@/types/notification";

/**
 * The colour family a notification's icon tile is drawn in. A name rather than
 * a class so this module stays free of styling; `NotificationListItem` maps it
 * to the palette.
 *
 * - `amber`: the app itself needs attention (an update is waiting).
 * - `blue`: someone shared a document with you.
 * - `green`: a document you sent was signed.
 * - `neutral`: a kind this module does not know about.
 * - `purple`: new in the template library.
 */
export type NotificationAccent =
  | "amber"
  | "blue"
  | "green"
  | "neutral"
  | "purple";

/** The two sections the panel splits its list into. */
export type NotificationGroupLabel = "Earlier" | "New";

/** One labelled section of the panel, in display order. */
export type NotificationGroup = {
  label: NotificationGroupLabel;
  notifications: readonly AppNotification[];
};

const accents: Record<string, NotificationAccent> = {
  "app-update": "amber",
  "document-shared": "blue",
  "document-signed": "green",
  template: "purple",
};

/**
 * The accent for a notification `kind`. `kind` is an open string so new sources
 * need no change in the UI; an unknown one falls back to `neutral`.
 */
export const notificationAccent = (kind: string): NotificationAccent =>
  accents[kind] ?? "neutral";

/**
 * How long ago a notification happened, in the short form the panel shows:
 * "Just now", "5m ago", "2h ago", "3d ago". Notifications older than 14 days
 * never reach the panel, so there is no week or month form.
 *
 * @param now - Epoch milliseconds to measure from. Defaults to the current time;
 *   pass it to keep a render or a test deterministic.
 */
export const formatNotificationAge = (createdAt: number, now = Date.now()) => {
  const minutes = Math.max(0, Math.floor((now - createdAt) / 60_000));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
};

/**
 * Splits notifications into "New" (unread) and "Earlier" (read), keeping each
 * section in the order it arrived in, which is newest first. A section with
 * nothing in it is left out, so the panel never shows an empty heading.
 *
 * A persistent notification (an update waiting) that is unread stays under
 * "New" until its source stops producing it.
 */
export const groupNotifications = (
  notifications: readonly AppNotification[],
): NotificationGroup[] => {
  const groups: NotificationGroup[] = [
    {
      label: "New",
      notifications: notifications.filter(({ read }) => !read),
    },
    {
      label: "Earlier",
      notifications: notifications.filter(({ read }) => read),
    },
  ];

  return groups.filter(({ notifications: items }) => items.length > 0);
};
