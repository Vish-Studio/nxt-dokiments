import type { ShareEvent, ShareEventKind } from "@/lib/sharing/share-activity";

export interface ShareTimelineProps {
  /** Events in chronological order, as returned by `shareTimeline`. */
  events: readonly ShareEvent[];
}

const verbs: Record<ShareEventKind, string> = {
  revoked: "Access revoked for",
  shared: "Shared with",
  signed: "Signed by",
  viewed: "Opened by",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  year: "numeric",
});

/**
 * The audit trail of a shared document: who it was shared with, when they
 * opened it, signed it, or lost access. Derived from timestamps already stored
 * on the share, so it is always consistent with the document.
 */
export const ShareTimeline = ({ events }: ShareTimelineProps) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <ol className="share-timeline grid gap-2">
      {events.map((event) => (
        <li
          className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm"
          key={`${event.kind}-${event.email}-${event.at}`}
        >
          <span className="min-w-0 wrap-break-word text-nox-noir/80">
            {verbs[event.kind]} {event.email}
          </span>
          <time
            className="text-xs text-nox-noir/60"
            dateTime={new Date(event.at).toISOString()}
          >
            {dateFormatter.format(event.at)}
          </time>
        </li>
      ))}
    </ol>
  );
};
