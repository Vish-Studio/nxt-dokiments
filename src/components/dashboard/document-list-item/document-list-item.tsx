import {
  DotsThreeVerticalIcon,
  DownloadSimpleIcon,
  FileTextIcon,
} from "@phosphor-icons/react";

import { Badge } from "@/components/commons/badge/badge";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { DocumentActionItems } from "@/components/dashboard/document-action-items/document-action-items";
import { EntryStatusPill } from "@/components/dashboard/entry-status-pill/entry-status-pill";
import {
  type EntryStatus,
  getDocumentCompanyName,
} from "@/lib/documents/company-groups";
import { getDocumentAmount } from "@/lib/documents/document-amount";
import {
  formatFullDate,
  formatNumericDate,
} from "@/lib/documents/format-document-date";
import { iconSize } from "@/lib/icons";
import { documentIcons } from "@/lib/market-place/document-icons";
import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";
import type { UserDocument } from "@/types/template";

export interface DocumentListItemProps {
  document: UserDocument;
  onEdit: (document: UserDocument) => void;
  onPreview: (document: UserDocument) => void;
  onPrint: (document: UserDocument) => void;
  /**
   * Adds a "Duplicate" action in the row menu. Omit it to hide the action. It is
   * also hidden for a document without a template snapshot, which can't be copied.
   */
  onDuplicate?: (document: UserDocument) => void;
  /** Adds a "Share" action in the row menu. Omit it while sharing is off. */
  onShare?: (document: UserDocument) => void;
  /** Adds a "View shared copy" action. Pass it only for a document that has been shared. */
  onViewShared?: (document: UserDocument) => void;
  /**
   * Adds a red "Delete" action at the end of the row menu. The caller confirms
   * before deleting; the row never deletes on its own.
   */
  onDelete?: (document: UserDocument) => void;
  /** Where the document stands (from `getEntryStatus`). Defaults to "Not shared". */
  status?: EntryStatus;
}

/**
 * Who the document is about, for the line under the title: the client it is
 * addressed to, or for a CV the person and their job title. `null` when the
 * document names nobody.
 */
const getDocumentSubject = (document: UserDocument) => {
  if (document.templateSnapshot?.documentType === "cv") {
    return (
      [document.values.fullName, document.values.jobTitle]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" · ") || null
    );
  }
  return getDocumentCompanyName(document);
};

export const DocumentListItem = ({
  document,
  onEdit,
  onPreview,
  onPrint,
  onDuplicate,
  onShare,
  onViewShared,
  onDelete,
  status = "not-shared",
}: DocumentListItemProps) => {
  const snapshot = document.templateSnapshot;
  const documentType = snapshot
    ? getDocumentTypeLabel(snapshot.documentType)
    : "Document";
  const TypeIcon = snapshot
    ? documentIcons[snapshot.documentType]
    : FileTextIcon;
  const documentTitle = document.values.title?.trim() || document.name;
  const subject = getDocumentSubject(document);
  const amount = getDocumentAmount(document.values);
  const createdDate = new Date(document.createdAt);
  const date = formatNumericDate(document.createdAt);

  return (
    <DashboardListRow
      // Phones: a two-column card. Title and the ⋮ menu on top, status and
      // amount below; type and date fold into the icon and the subtitle.
      className="document-list-item max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-3 max-sm:gap-y-3"
      onSelect={() => onPreview(document)}
      selectLabel={`Open preview for ${documentTitle}`}
    >
      <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-3 max-sm:col-start-1 max-sm:row-start-1 sm:col-span-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-field bg-play-purple text-nox-noir">
          <TypeIcon
            aria-hidden
            size={iconSize.tile}
            weight="bold"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate font-title text-sm font-bold text-nox-noir sm:text-base">
            {documentTitle}
          </p>
          <p className="mt-0.5 truncate text-xs text-nox-noir/55">
            {subject ? (
              <span>{subject}</span>
            ) : (
              <span className="text-nox-noir/40">No client yet</span>
            )}
            <span className="sm:hidden"> · {date}</span>
          </p>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 max-sm:hidden sm:col-span-2">
        <Badge>{documentType}</Badge>
      </div>

      <div
        className="pointer-events-none relative z-10 self-center truncate text-right text-sm font-semibold tabular-nums text-nox-noir max-sm:col-start-2 max-sm:row-start-2 sm:col-span-2 sm:pr-4"
        title={amount || undefined}
      >
        {amount || (
          <span className="font-normal text-nox-noir/30 max-sm:hidden">—</span>
        )}
      </div>

      <div className="pointer-events-none relative z-10 self-center max-sm:col-start-1 max-sm:row-start-2 sm:col-span-2">
        <EntryStatusPill status={status} />
      </div>

      <div className="pointer-events-none relative z-10 max-sm:hidden sm:col-span-1">
        <time
          className="text-sm whitespace-nowrap text-nox-noir/65 tabular-nums"
          dateTime={createdDate.toISOString()}
          title={formatFullDate(document.createdAt)}
        >
          {date}
        </time>
      </div>

      {/* Desktop: a Download PDF icon and the ⋮ menu. Phones: only the ⋮,
          top right, opening a bottom sheet. Every action is in the menu.
          focus-within lifts this row above the next while its menu is open. */}
      <div className="relative z-20 flex items-center justify-end gap-1 focus-within:z-30 max-sm:col-start-2 max-sm:row-start-1 max-sm:-mr-2 sm:col-span-2 sm:justify-self-end">
        <ButtonIcon
          aria-label={`Download PDF of ${documentTitle}`}
          className="max-sm:hidden"
          icon={
            <DownloadSimpleIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
          }
          onClick={() => onPrint(document)}
          shape="square"
          size="sm"
          variant="outline"
        />
        <div className="flex size-10 shrink-0 items-center justify-center">
          <Dropdown
            ariaLabel={`More actions for ${documentTitle}`}
            buttonClassName="size-8 min-h-8 text-nox-noir hover:bg-base-200"
            className="shrink-0"
            iconTrigger={
              <DotsThreeVerticalIcon
                aria-hidden
                size={iconSize.tile}
                weight="bold"
              />
            }
            iconTriggerShape="square"
            menuClassName="w-52"
            sheetIcon={TypeIcon}
            sheetTitle={documentTitle}
          >
            <DocumentActionItems
              document={document}
              onDelete={onDelete}
              onDownload={onPrint}
              onDuplicate={onDuplicate}
              onEdit={onEdit}
              onShare={onShare}
              onViewShared={onViewShared}
            />
          </Dropdown>
        </div>
      </div>
    </DashboardListRow>
  );
};
