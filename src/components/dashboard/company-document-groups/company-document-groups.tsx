"use client";

import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CaretDownIcon,
  DotsThreeVerticalIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  PencilSimpleIcon,
  PlusIcon,
  ShareNetworkIcon,
  UserCircleDashedIcon,
  type Icon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useId, useState } from "react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { Button } from "@/components/commons/button/button";
import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { EntryStatusPill } from "@/components/dashboard/entry-status-pill/entry-status-pill";
import { getAvatarColorClass } from "@/lib/clients/avatar-color";
import { iconSize } from "@/lib/icons";
import {
  type CompanyDocumentGroup,
  type CompanyEntry,
  entryStatusLabels,
  getEntryStatus,
} from "@/lib/documents/company-groups";
import {
  companyNewDocumentHref,
  companyPageHref,
} from "@/lib/documents/company-page-href";
import {
  formatFullDate,
  formatNumericDate,
} from "@/lib/documents/format-document-date";
import { documentIcons } from "@/lib/market-place/document-icons";
import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";
import { cn } from "@/lib/utils";
import type { UserDocument } from "@/types/template";

/** Row menu actions for the user's own documents. */
export interface CompanyRowActions {
  /** Opens the document in the editor. */
  onEdit: (document: UserDocument) => void;
  /** Opens the PDF export. */
  onDownload: (document: UserDocument) => void;
  /** Opens the share dialog; omit while sharing is off. */
  onShare?: (document: UserDocument) => void;
}

export interface CompanyDocumentGroupsProps extends CompanyRowActions {
  groups: CompanyDocumentGroup[];
  /** Opens a document: preview for created ones, the shared view for received ones. */
  onOpenEntry: (entry: CompanyEntry) => void;
  /** Documents shown per company before "Show N more". Defaults to 5. */
  previewCount?: number;
}

/** Shared with `CompanyDocumentGroupsSkeleton`. */
export const companyGroupSectionClassName =
  "rounded-box border border-steel-mist bg-base-100";

/**
 * Row columns. Phones: title (with a "date · status" line), amount, menu.
 * `sm`: title, amount, status, date, menu. `lg` adds the type after the title.
 */
export const companyGroupRowColumns =
  "grid-cols-[minmax(0,1fr)_auto_2rem] sm:grid-cols-[minmax(0,1fr)_7.5rem_10.5rem_4.5rem_2rem] lg:grid-cols-[minmax(0,1fr)_7rem_7.5rem_10.5rem_4.5rem_2rem]";

const MenuItem = ({
  icon: ItemIcon,
  label,
  onClick,
}: {
  icon: Icon;
  label: string;
  onClick: () => void;
}) => (
  <Button
    className="w-full justify-start gap-2 px-3 whitespace-nowrap"
    icon={
      <ItemIcon
        aria-hidden
        size={iconSize.control}
        weight="bold"
      />
    }
    iconPosition="left"
    onClick={onClick}
    size="sm"
    variant="ghost"
  >
    {label}
  </Button>
);

const CompanyRow = ({
  actions,
  entry,
  onOpen,
}: {
  actions: CompanyRowActions;
  entry: CompanyEntry;
  onOpen: (entry: CompanyEntry) => void;
}) => {
  const TypeIcon = entry.documentType
    ? documentIcons[entry.documentType]
    : FileTextIcon;
  const status = getEntryStatus(entry);
  const typeLabel = entry.documentType
    ? getDocumentTypeLabel(entry.documentType)
    : "Document";
  // dd/mm/yy: exact and narrow enough for the column; the title attribute
  // spells the month out for anyone unsure of the order.
  const date = formatNumericDate(entry.createdAt);
  const isReceived = entry.source === "received";
  const { document } = entry;

  return (
    // focus-within lifts the row above the ones below while its menu is open.
    <li className="relative transition-colors hover:bg-base-200/60 focus-within:z-30 last:rounded-b-box">
      {/* Whole-row target behind the content, so the row can hold its menu. */}
      <button
        aria-label={`${isReceived ? "Open" : "Preview"} ${entry.title}`}
        className="absolute inset-0 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nox-noir"
        onClick={() => onOpen(entry)}
        type="button"
      />
      <div
        className={cn(
          "pointer-events-none relative grid items-center gap-x-3 py-2 pl-4 pr-2 sm:gap-x-4",
          companyGroupRowColumns,
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <TypeIcon
            aria-hidden
            className="shrink-0 text-nox-noir/50"
            size={iconSize.control}
          />
          <span className="min-w-0">
            <span className="block truncate text-sm text-nox-noir">
              {entry.title}
            </span>
            {/* Phones: one muted line instead of the columns. */}
            <span className="block truncate text-xs text-nox-noir/50 sm:hidden">
              {isReceived ? `From ${entry.sharedBy} · ` : ""}
              {date} · {entryStatusLabels[status]}
            </span>
          </span>
        </span>
        <span className="truncate text-xs text-nox-noir/55 max-lg:hidden">
          {typeLabel}
        </span>
        <span
          className="truncate text-right text-sm font-semibold tabular-nums text-nox-noir"
          title={entry.amount || undefined}
        >
          {entry.amount || (
            <span className="font-normal text-nox-noir/30 max-sm:hidden">
              —
            </span>
          )}
        </span>
        <span className="max-sm:hidden">
          <EntryStatusPill status={status} />
        </span>
        <time
          className="text-right text-xs tabular-nums text-nox-noir/55 max-sm:hidden"
          dateTime={new Date(entry.createdAt).toISOString()}
          title={formatFullDate(entry.createdAt)}
        >
          {date}
        </time>
        <span className="pointer-events-auto flex justify-end">
          <Dropdown
            ariaLabel={`More actions for ${entry.title}`}
            buttonClassName="size-8 min-h-8 text-nox-noir/70 hover:bg-base-100 hover:text-nox-noir"
            className="shrink-0"
            iconTrigger={
              <DotsThreeVerticalIcon
                aria-hidden
                size={iconSize.tile}
                weight="bold"
              />
            }
            iconTriggerShape="square"
            menuClassName="w-48"
            sheetIcon={TypeIcon}
            sheetTitle={entry.title}
          >
            {document ? (
              <>
                <MenuItem
                  icon={PencilSimpleIcon}
                  label="Edit"
                  onClick={() => actions.onEdit(document)}
                />
                <MenuItem
                  icon={DownloadSimpleIcon}
                  label="Download PDF"
                  onClick={() => actions.onDownload(document)}
                />
                {actions.onShare ? (
                  <MenuItem
                    icon={ShareNetworkIcon}
                    label="Share"
                    onClick={() => actions.onShare?.(document)}
                  />
                ) : null}
              </>
            ) : (
              <MenuItem
                icon={ArrowSquareOutIcon}
                label="Open"
                onClick={() => onOpen(entry)}
              />
            )}
          </Dropdown>
        </span>
      </div>
    </li>
  );
};

const CompanyGroup = ({
  actions,
  group,
  onOpenEntry,
  previewCount,
}: {
  actions: CompanyRowActions;
  group: CompanyDocumentGroup;
  onOpenEntry: (entry: CompanyEntry) => void;
  previewCount: number;
}) => {
  const headingId = useId();
  const listId = useId();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isNoClient = group.name === null;
  const name = group.name ?? "No client yet";
  const count = group.entries.length;
  const visible = isExpanded
    ? group.entries
    : group.entries.slice(0, previewCount);
  const hidden = count - visible.length;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "company-document-group",
        companyGroupSectionClassName,
        isNoClient && "border-dashed",
      )}
    >
      <header
        className={cn(
          "flex min-w-0 items-center gap-3 rounded-t-box bg-base-200/60 px-3 py-2",
          isCollapsed && "rounded-b-box",
          !isCollapsed && "border-b border-steel-mist/70",
        )}
      >
        <button
          aria-controls={listId}
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? "Show" : "Hide"} documents for ${name}`}
          className="grid size-8 shrink-0 place-items-center rounded-field text-nox-noir/55 transition-colors hover:bg-base-100 hover:text-nox-noir focus-visible:outline-2 focus-visible:outline-nox-noir"
          onClick={() => setIsCollapsed((value) => !value)}
          type="button"
        >
          <CaretDownIcon
            aria-hidden
            className={cn("transition-transform", isCollapsed && "-rotate-90")}
            size={iconSize.inline}
            weight="bold"
          />
        </button>
        {isNoClient ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-dashed border-steel-mist text-nox-noir/45">
            <UserCircleDashedIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
          </span>
        ) : (
          <Avatar
            className={cn(
              getAvatarColorClass(group.client?.id ?? group.key),
              "text-nox-noir",
            )}
            name={name}
            size="sm"
          />
        )}
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h3
            className="truncate font-title text-sm font-bold text-nox-noir"
            id={headingId}
          >
            {name}
          </h3>
          <span className="shrink-0 text-xs text-nox-noir/50">
            {count}
            <span className="sr-only">
              {" "}
              {count === 1 ? "document" : "documents"}
            </span>
          </span>
        </div>
        <Link
          aria-label={`View company ${name}`}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-field px-2 font-title text-xs font-semibold text-nox-noir transition-colors hover:bg-base-100 focus-visible:outline-2 focus-visible:outline-nox-noir"
          href={companyPageHref(group.key)}
        >
          <span className="max-sm:hidden">View company</span>
          <ArrowRightIcon
            aria-hidden
            size={iconSize.inline}
            weight="bold"
          />
        </Link>
        {isNoClient ? null : (
          <Link
            aria-label={`New document for ${name}`}
            className="grid size-8 shrink-0 place-items-center rounded-field bg-base-100 text-nox-noir transition-colors hover:bg-nox-noir hover:text-white focus-visible:outline-2 focus-visible:outline-nox-noir"
            href={companyNewDocumentHref(group)}
            title="New document"
          >
            <PlusIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
          </Link>
        )}
      </header>

      <div
        hidden={isCollapsed}
        id={listId}
      >
        <ul
          aria-label={`Documents for ${name}`}
          className="divide-y divide-steel-mist/60"
        >
          {visible.map((entry) => (
            <CompanyRow
              actions={actions}
              entry={entry}
              key={entry.id}
              onOpen={onOpenEntry}
            />
          ))}
        </ul>
        {count > previewCount ? (
          <button
            className="w-full rounded-b-box border-t border-steel-mist/60 px-4 py-2 text-left text-xs font-semibold text-nox-noir/60 transition-colors hover:bg-base-200/60 hover:text-nox-noir focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nox-noir"
            onClick={() => setIsExpanded((value) => !value)}
            type="button"
          >
            {hidden > 0 ? `Show ${hidden} more` : "Show less"}
          </button>
        ) : null}
      </div>
    </section>
  );
};

/**
 * The My Documents "Companies" tab: every document, created or shared with
 * the user, grouped by company. Each company is a section with a header
 * (collapse toggle, avatar, name and count, "View company", "+" for a new
 * document with the company filled in) above its latest documents as rows:
 * type icon, title, type, amount, status pill, date and a vertical "⋮" menu
 * (Edit, Download PDF, Share for the user's own documents; Open for received
 * ones). On phones: title with a "date · status" line, amount and menu. Rows
 * open the preview (created) or the shared view (received); "Show N more"
 * reveals the rest of a long group. Sections don't clip (`overflow-hidden`
 * would cut the row menus), so the header and footer round their own corners.
 */
export const CompanyDocumentGroups = ({
  groups,
  onDownload,
  onEdit,
  onOpenEntry,
  onShare,
  previewCount = 5,
}: CompanyDocumentGroupsProps) =>
  groups.length === 0 ? (
    <div className="company-document-groups grid min-h-48 place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-8 text-center">
      <div>
        <p className="font-title text-base font-bold text-nox-noir">
          No documents match
        </p>
        <p className="mt-1 text-sm text-nox-noir/60">
          Try another search or clear the filters.
        </p>
      </div>
    </div>
  ) : (
    <div className="company-document-groups grid gap-4">
      {groups.map((group) => (
        <CompanyGroup
          actions={{ onDownload, onEdit, onShare }}
          group={group}
          key={group.key}
          onOpenEntry={onOpenEntry}
          previewCount={previewCount}
        />
      ))}
    </div>
  );

export default CompanyDocumentGroups;
