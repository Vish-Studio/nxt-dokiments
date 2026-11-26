import { LoadingStatus } from "@/components/commons/loading-status/loading-status";

/**
 * Placeholder rows shaped like `NotificationListItem` while the first fetch is
 * in flight, so the panel does not jump when the list arrives. The shimmer is
 * hidden from assistive tech; the status message is what it hears.
 */
export const NotificationListSkeleton = () => (
  <div className="notification-list-skeleton px-2 py-2">
    <LoadingStatus message="Loading notifications…" />
    <ul
      aria-hidden
      className="flex flex-col gap-1"
    >
      {[0, 1, 2].map((row) => (
        <li
          className="flex gap-3 px-3 py-3"
          key={row}
        >
          <div className="skeleton size-9 shrink-0 rounded-field" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/3 rounded-field" />
            <div className="skeleton h-3 w-full rounded-field" />
            <div className="skeleton h-3 w-1/4 rounded-field" />
          </div>
        </li>
      ))}
    </ul>
  </div>
);
