import { NotificationListItem } from "@/components/dashboard/notification-list-item/notification-list-item";
import type { NotificationGroup as NotificationGroupData } from "@/lib/notifications/notification-display";

export interface NotificationGroupProps {
  group: NotificationGroupData;
  /** Epoch milliseconds the ages are measured from; see `NotificationListItem`. */
  now?: number;
}

/**
 * One labelled section of the panel ("New" or "Earlier") with its count. The
 * list is the section's accessible content, so a screen reader hears
 * "New, 2 notifications" before the items.
 */
export const NotificationGroup = ({ group, now }: NotificationGroupProps) => (
  <section
    aria-label={`${group.label}, ${group.notifications.length} ${group.notifications.length === 1 ? "notification" : "notifications"}`}
    className="notification-group"
  >
    <h3
      aria-hidden
      className="flex items-center gap-2 px-3 pt-3 pb-1 font-title text-xs font-bold tracking-wide text-nox-noir/50 uppercase"
    >
      {group.label}
      <span className="font-semibold">{group.notifications.length}</span>
    </h3>
    <ul className="flex flex-col gap-1 px-2 pb-1">
      {group.notifications.map((notification) => (
        <NotificationListItem
          key={notification.id}
          notification={notification}
          now={now}
        />
      ))}
    </ul>
  </section>
);
