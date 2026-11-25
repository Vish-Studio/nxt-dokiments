import type { Icon } from "@phosphor-icons/react";
import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  FilePlusIcon,
  InfoIcon,
  SealCheckIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import { formatFullDate } from "@/lib/documents/format-document-date";
import { iconSize } from "@/lib/icons";
import {
  formatNotificationAge,
  notificationAccent,
  type NotificationAccent,
} from "@/lib/notifications/notification-display";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

export interface NotificationListItemProps {
  notification: AppNotification;
  /**
   * Epoch milliseconds the age is measured from. Defaults to the current time;
   * pass it to keep a story deterministic.
   */
  now?: number;
}

/** Icon per notification `kind`; an unknown kind gets a generic one. */
const kindIcons: Record<string, Icon> = {
  "app-update": ArrowsClockwiseIcon,
  "document-shared": ShareNetworkIcon,
  "document-signed": SealCheckIcon,
  template: FilePlusIcon,
};

/** Tile colours per accent. Colour carries the kind, never decoration. */
const tileClasses: Record<NotificationAccent, string> = {
  amber: "bg-golden-harvest text-nox-noir",
  blue: "bg-play-blue text-nox-noir",
  green: "bg-success/15 text-success",
  neutral: "bg-base-200 text-nox-noir",
  purple: "bg-play-purple text-nox-noir",
};

const actionClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-field border border-steel-mist bg-base-100 px-3 font-title text-xs font-semibold text-nox-noir transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir";

/**
 * One notification in the panel: a tinted icon tile for its kind, the title
 * with an unread dot, a short body, how long ago it happened, and the one
 * action that follows it up.
 *
 * Unread items sit on a light grey surface and carry a dot; the dot is also
 * announced ("unread") so the state is not conveyed by colour alone. A
 * persistent notification (an update waiting) gets a golden action so it reads
 * as the thing to do next.
 */
export const NotificationListItem = ({
  notification,
  now,
}: NotificationListItemProps) => {
  const { action, body, createdAt, kind, persistent, read, title } =
    notification;
  const KindIcon = kindIcons[kind] ?? InfoIcon;
  const actionContent = action ? (
    <>
      {action.label}
      <ArrowRightIcon
        aria-hidden
        size={iconSize.inline}
        weight="bold"
      />
    </>
  ) : null;
  const accentedActionClassName = cn(
    actionClassName,
    persistent && "border-transparent bg-golden-harvest hover:brightness-95",
  );

  return (
    <li
      className={cn(
        "notification-list-item flex gap-3 rounded-field px-3 py-3",
        !read && "bg-base-200/70",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-field",
          tileClasses[notificationAccent(kind)],
        )}
      >
        <KindIcon
          aria-hidden
          size={iconSize.tile}
          weight="bold"
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-start gap-2 text-sm leading-5 font-semibold text-nox-noir">
          <span className="min-w-0 flex-1">{title}</span>
          {!read ? (
            <>
              <span
                aria-hidden
                className="mt-1.5 size-2 shrink-0 rounded-full bg-nox-noir"
              />
              <span className="sr-only">(unread)</span>
            </>
          ) : null}
        </p>
        {body ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-nox-noir/65">
            {body}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <time
            className="text-xs text-nox-noir/50"
            dateTime={new Date(createdAt).toISOString()}
            title={formatFullDate(createdAt)}
          >
            {formatNotificationAge(createdAt, now)}
          </time>
          {action?.href ? (
            <Link
              className={accentedActionClassName}
              href={action.href}
            >
              {actionContent}
            </Link>
          ) : action?.onClick ? (
            <button
              className={accentedActionClassName}
              onClick={action.onClick}
              type="button"
            >
              {actionContent}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
};
