import { FileTextIcon } from "@phosphor-icons/react";

import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { ShareStatusBadge } from "@/components/dashboard/share-status-badge/share-status-badge";
import type { ShareRecipientStatus, SharedDocument } from "@/types/sharing";

export interface SharedDocumentListItemProps {
  /** The shared copy; its owner and share date fill the row. */
  document: SharedDocument;
  /** Called when the row is activated, to open the read-only preview. */
  onOpen: (document: SharedDocument) => void;
  /** The signed-in user's own progress on this document. */
  status: ShareRecipientStatus;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** One document someone else shared with the user: title, sender, date and status. */
export const SharedDocumentListItem = ({
  document,
  onOpen,
  status,
}: SharedDocumentListItemProps) => {
  const title = document.values.title?.trim() || document.name;
  const sharedDate = new Date(document.createdAt);

  return (
    <DashboardListRow
      className="shared-document-list-item"
      onSelect={() => onOpen(document)}
      selectLabel={`Open ${title}`}
    >
      <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-3 sm:col-span-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-field bg-play-purple text-nox-noir">
          <FileTextIcon
            aria-hidden
            size={20}
            weight="bold"
          />
        </span>
        <p className="min-w-0 truncate font-title text-sm font-bold text-nox-noir sm:text-base">
          {title}
        </p>
      </div>

      <div className="pointer-events-none relative z-10 min-w-0 sm:col-span-3">
        <span className="mb-1 block font-title text-xs font-semibold text-nox-noir/45 sm:hidden">
          Shared by
        </span>
        <p className="truncate text-sm font-semibold text-nox-noir">
          {document.ownerName || document.ownerEmail}
        </p>
        {document.ownerName ? (
          <p className="truncate text-xs text-nox-noir/50">
            {document.ownerEmail}
          </p>
        ) : null}
      </div>

      <div className="pointer-events-none relative z-10 sm:col-span-2">
        <span className="mb-1 block font-title text-xs font-semibold text-nox-noir/45 sm:hidden">
          Shared on
        </span>
        <time
          className="text-sm text-nox-noir/65"
          dateTime={sharedDate.toISOString()}
        >
          {dateFormatter.format(sharedDate)}
        </time>
      </div>

      <div className="pointer-events-none relative z-10 sm:col-span-2 sm:justify-self-end">
        <ShareStatusBadge status={status} />
      </div>
    </DashboardListRow>
  );
};
