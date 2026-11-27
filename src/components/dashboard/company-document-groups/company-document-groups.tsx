"use client";

import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CaretRightIcon,
  DotsThreeVerticalIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  UserCircleDashedIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useId, useState } from "react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { Button } from "@/components/commons/button/button";
import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { DropdownMenuItem } from "@/components/commons/dropdown-menu-item/dropdown-menu-item";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { StatusDot } from "@/components/commons/status-dot/status-dot";
import {
  DocumentActionItems,
  type DocumentActionItemsProps,
} from "@/components/dashboard/document-action-items/document-action-items";
import { EntryStatusPill } from "@/components/dashboard/entry-status-pill/entry-status-pill";
import { getAvatarColorClass } from "@/lib/clients/avatar-color";
import { iconSize } from "@/lib/icons";
import {
  getCompanyGroupSummary,
  getEntryActivity,
  getEntryContact,
  getEntryNumber,
} from "@/lib/documents/company-entry-details";
import { entryStatusTone } from "@/lib/documents/entry-status-tone";
import {
  type CompanyDocumentGroup,
  type CompanyEntry,
  entryStatusLabels,
  getEntryStatus,
} from "@/lib/documents/company-groups";
import { companyPageHref } from "@/lib/documents/company-page-href";
import {
  formatFullDate,
  formatNumericDate,
} from "@/lib/documents/format-document-date";
import { documentIcons } from "@/lib/market-place/document-icons";
import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";
import { cn } from "@/lib/utils";

/**
 * Row menu actions for the user's own documents: the same set as the My
 * documents rows (see {@link DocumentActionItems}). `onViewShared` is offered
 * only on rows whose document has been shared.
 */
export type CompanyRowActions = Omit<DocumentActionItemsProps, "document">;

export interface CompanyDocumentGroupsProps extends CompanyRowActions {
  groups: CompanyDocumentGroup[];
  /** Opens a document: preview for created ones, the shared view for received ones. */
  onOpenEntry: (entry: CompanyEntry) => void;
  /** The filtered-empty state's "Clear filters" action. */
  onReset?: () => void;
  /** Documents shown per company before "Show N more". Defaults to 5. */
  previewCount?: number;
}

/**
 * Shared with `CompanyDocumentGroupsSkeleton`. `rounded-xl` (12px), a step
 * under `rounded-box`: the user found 16px too round for these list cards.
 */
export const companyGroupSectionClassName =
  "rounded-xl border border-steel-mist bg-base-100";

/**
 * Row columns from `sm`: document (title over "type · number"), amount,
 * status (pill over what happened and when), updated, menu. From `lg` a
 * "Shared with" column (recipient email or sender) sits before the status;
 * its cell is `lg`-only, so it takes no grid cell below that. Phones use a
 * slim one-line row instead (see `CompanyRow`). Shared with the labels.
 */
export const companyGroupRowColumns =
  "sm:grid-cols-[minmax(0,1fr)_6.5rem_10rem_5rem_2.25rem] lg:grid-cols-[minmax(0,1fr)_7rem_minmax(0,14rem)_10.5rem_5.5rem_2.25rem]";

/**
 * One document in a company card.
 *
 * From `sm` it is a row of an overview table: type tile, title over
 * "type · number", amount, who it was shared with (`lg`+), status pill over
 * what happened and when ("Sent 20/11/26"), the updated date and a "⋮" menu.
 * On phones it is a slim one-line peek: status dot, title over the status
 * word, and the same "⋮" menu (a bottom sheet there). The whole row opens
 * the document.
 */
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
  const number = getEntryNumber(entry);
  const contact = getEntryContact(entry);
  const isReceived = entry.source === "received";
  const { document } = entry;
  // The same actions on both layouts; only one layout is shown per size.
  const rowMenu = (
    <Dropdown
      ariaLabel={`More actions for ${entry.title}`}
      buttonClassName="size-8 min-h-8 text-nox-noir/70 hover:bg-base-100 hover:text-nox-noir max-sm:size-10 max-sm:min-h-10"
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
        <DocumentActionItems
          {...actions}
          document={document}
          onViewShared={entry.shareStatus ? actions.onViewShared : undefined}
        />
      ) : (
        <DropdownMenuItem
          icon={ArrowSquareOutIcon}
          onClick={() => onOpen(entry)}
        >
          Open
        </DropdownMenuItem>
      )}
    </Dropdown>
  );

  return (
    // focus-within lifts the row above the ones below while its menu is open.
    <li className="relative transition-colors hover:bg-base-200/60 focus-within:z-30 last:rounded-b-xl">
      {/* Whole-row target behind the content, so the row can hold its menu. */}
      <button
        aria-label={`${isReceived ? "Open" : "Preview"} ${entry.title}`}
        className="absolute inset-0 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nox-noir"
        onClick={() => onOpen(entry)}
        type="button"
      />

      {/* Phones: a slim peek. */}
      <div className="pointer-events-none relative flex min-h-13 min-w-0 items-center gap-3 py-2 pl-4 pr-2 sm:hidden">
        <StatusDot
          size="md"
          tone={entryStatusTone[status]}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-title text-sm font-semibold text-nox-noir">
            {entry.title}
          </span>
          <span className="block truncate text-xs text-nox-noir/60">
            {entryStatusLabels[status]}
          </span>
        </span>
        {/* The actions, as before; the amount is in the preview. */}
        <span className="pointer-events-auto -mr-2 flex shrink-0">
          {rowMenu}
        </span>
      </div>

      {/* From sm: the overview row. */}
      <div
        className={cn(
          "pointer-events-none relative hidden items-center gap-x-4 py-3 pl-4 pr-2 sm:grid",
          companyGroupRowColumns,
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-field bg-base-200 text-nox-noir/60">
            <TypeIcon
              aria-hidden
              size={iconSize.control}
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-title text-sm font-semibold text-nox-noir">
              {entry.title}
            </span>
            <span className="block truncate text-xs text-nox-noir/60">
              {number ? `${typeLabel} · ${number}` : typeLabel}
            </span>
          </span>
        </span>
        <span
          className="truncate text-right text-sm font-bold tabular-nums text-nox-noir"
          title={entry.amount || undefined}
        >
          {/* Column labels are visual only; name each value for screen readers. */}
          {entry.amount ? <span className="sr-only">Amount: </span> : null}
          {entry.amount}
        </span>
        {/* lg+: who it was exchanged with, so the status line can be short. */}
        <span
          className="truncate pl-4 text-sm text-nox-noir/80 max-lg:hidden"
          title={contact || undefined}
        >
          <span className="sr-only">Shared with: </span>
          {contact || (
            <>
              <span
                aria-hidden
                className="text-nox-noir/60"
              >
                —
              </span>
              <span className="sr-only">no one</span>
            </>
          )}
        </span>
        <span className="grid min-w-0 justify-items-start gap-1">
          <EntryStatusPill status={status} />
          <span className="max-w-full truncate text-xs text-nox-noir/60">
            {getEntryActivity(entry)}
          </span>
        </span>
        <time
          className="text-right text-xs tabular-nums text-nox-noir/60"
          dateTime={new Date(entry.updatedAt).toISOString()}
          title={formatFullDate(entry.updatedAt)}
        >
          <span className="sr-only">Updated: </span>
          {formatNumericDate(entry.updatedAt)}
        </time>
        <span className="pointer-events-auto flex justify-end">{rowMenu}</span>
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
  const summary = getCompanyGroupSummary(group);

  return (
    // Named directly: the heading's link reads "View company …".
    <section
      aria-label={name}
      className={cn(
        "company-document-group min-w-0",
        companyGroupSectionClassName,
        isNoClient && "border-dashed",
      )}
    >
      <header
        className={cn(
          "flex min-w-0 items-center gap-3 rounded-t-xl bg-base-200/60 py-2.5 pr-2 pl-4 sm:pl-3 sm:pr-4",
          isCollapsed && "rounded-b-xl",
          !isCollapsed && "border-b border-steel-mist/70",
        )}
      >
        {/* Desktop: first. Phones: after the name, at the right end. */}
        <button
          aria-controls={listId}
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? "Show" : "Hide"} documents for ${name}`}
          className="grid size-10 shrink-0 place-items-center rounded-field text-nox-noir/60 transition-colors hover:bg-base-100 hover:text-nox-noir focus-visible:outline-2 focus-visible:outline-nox-noir max-sm:order-1 sm:size-8"
          onClick={() => setIsCollapsed((value) => !value)}
          type="button"
        >
          <CaretDownIcon
            aria-hidden
            className={cn("transition-transform", isCollapsed && "-rotate-90")}
            size={iconSize.control}
            weight="bold"
          />
        </button>
        {isNoClient ? (
          // Phones show only the name: the dashed card already says "no client".
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-steel-mist text-nox-noir/45 max-sm:hidden">
            <UserCircleDashedIcon
              aria-hidden
              size={iconSize.tile}
              weight="bold"
            />
          </span>
        ) : (
          // Decorative: the name follows, so screen readers skip the
          // initials. Phones show only the company name, not the avatar.
          <span
            aria-hidden
            className="shrink-0 max-sm:hidden"
          >
            <Avatar
              className={cn(
                getAvatarColorClass(group.client?.id ?? group.key),
                "text-nox-noir",
              )}
              name={name}
              size="md"
            />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="min-w-0 font-title text-base font-bold text-nox-noir">
            <Link
              aria-label={`View company ${name}`}
              className="group relative inline-flex max-w-full items-center gap-1 rounded-field before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir"
              href={companyPageHref(group.key)}
            >
              <span className="truncate">{name}</span>
              <CaretRightIcon
                aria-hidden
                className="shrink-0 text-nox-noir/50 transition-transform group-hover:translate-x-0.5"
                size={iconSize.inline}
                weight="bold"
              />
            </Link>
          </h3>
          {/* Phones: under the name, as there is no room beside it. */}
          <p className="truncate text-xs text-nox-noir/60 sm:hidden">
            {summary}
          </p>
        </div>
        {/* From `sm` the summary sits at the header's right end. */}
        <p className="min-w-0 shrink truncate text-right text-xs text-nox-noir/60 max-sm:hidden">
          {summary}
        </p>
      </header>

      <div
        hidden={isCollapsed}
        id={listId}
      >
        <div
          aria-hidden
          className={cn(
            "hidden gap-x-4 py-2 pl-4 pr-2 font-title text-xs font-bold tracking-wider text-nox-noir/65 uppercase sm:grid",
            companyGroupRowColumns,
          )}
        >
          <span className="pl-11">Document</span>
          <span className="text-right">Amount</span>
          <span className="pl-4 max-lg:hidden">Shared with</span>
          <span>Status</span>
          <span className="text-right">Updated</span>
          <span />
        </div>
        <ul
          aria-label={`Documents for ${name}`}
          className="divide-y divide-steel-mist/60 sm:border-t sm:border-steel-mist/60"
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
            className="w-full rounded-b-xl border-t border-steel-mist/60 px-4 py-2.5 text-left text-xs font-semibold text-nox-noir/60 transition-colors hover:bg-base-200/60 hover:text-nox-noir focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nox-noir"
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
 * the user, grouped by company. Each company is a card. Its header holds the
 * collapse toggle, the avatar (from `sm`; phones show only the name), the
 * name (a link to the company page) over a
 * summary ("4 documents · 1 awaiting signature") and a black "+" for a new
 * document with the company filled in; phones move the toggle beside the "+".
 * From `sm` the documents are an overview table (document, amount, "Shared
 * with" from `lg`, status with what happened and when, updated, "⋮");
 * phones show slim one-line rows.
 * Rows open the preview (created) or the shared view (received); "Show N
 * more" reveals the rest of a long group. Sections don't clip
 * (`overflow-hidden` would cut the row menus), so the header and footer
 * round their own corners.
 */
export const CompanyDocumentGroups = ({
  groups,
  onDelete,
  onDownload,
  onDuplicate,
  onEdit,
  onOpenEntry,
  onReset,
  onShare,
  onViewShared,
  previewCount = 5,
}: CompanyDocumentGroupsProps) =>
  groups.length === 0 ? (
    <EmptyState
      action={
        onReset ? (
          <Button
            onClick={onReset}
            size="sm"
            variant="outline"
          >
            Clear filters
          </Button>
        ) : undefined
      }
      className="company-document-groups"
      description="Try another search, or clear the filters to see all your documents."
      icon={
        <MagnifyingGlassIcon
          aria-hidden
          size={iconSize.feature}
          weight="bold"
        />
      }
      title="No documents match"
    />
  ) : (
    // grid-cols-1 (minmax(0, 1fr)) lets a card shrink below its content, so a
    // long company name truncates instead of scrolling the page sideways.
    <div className="company-document-groups grid grid-cols-1 gap-4">
      {groups.map((group) => (
        <CompanyGroup
          actions={{
            onDelete,
            onDownload,
            onDuplicate,
            onEdit,
            onShare,
            onViewShared,
          }}
          group={group}
          key={group.key}
          onOpenEntry={onOpenEntry}
          previewCount={previewCount}
        />
      ))}
    </div>
  );

export default CompanyDocumentGroups;
