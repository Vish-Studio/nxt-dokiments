/** What clicking a notification does. Server-produced notifications can only carry an `href`. */
export type NotificationAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

/**
 * The one shape every notification takes, whatever produced it. The bell renders
 * a list of these and knows nothing about where they came from — see
 * `docs/notifications.md` for how to add a new source.
 *
 * `kind` is an open string (`"template"`, `"app-update"`, …) so a new source needs
 * no change here; it only picks the icon in `NotificationBell`.
 */
export type AppNotification = {
  /** Epoch milliseconds; the list is sorted newest first by this. */
  createdAt: number;
  /** Stable and unique across sources, conventionally `"<kind>:<key>"`. */
  id: string;
  kind: string;
  read: boolean;
  title: string;
  action?: NotificationAction;
  body?: string;
  /**
   * A condition rather than an event (e.g. "an update is waiting"): it stays until
   * its source stops producing it, and "mark all as read" does not clear it.
   */
  persistent?: boolean;
};

/** Response shape of `GET /api/notifications` (server-produced sources only). */
export type NotificationsResponse = {
  notifications: AppNotification[];
};
