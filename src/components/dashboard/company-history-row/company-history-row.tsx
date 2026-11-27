"use client";

import {
  ArrowSquareOutIcon,
  FileTextIcon,
  PencilSimpleIcon,
  PrinterIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import {
  ButtonIcon,
  buttonIconClasses,
} from "@/components/commons/button-icon/button-icon";
import { StatusPill } from "@/components/commons/status-pill/status-pill";
import { iconSize } from "@/lib/icons";
import type { CompanyEntry } from "@/lib/documents/company-groups";
import { formatFullDate } from "@/lib/documents/format-document-date";
import { documentIcons } from "@/lib/market-place/document-icons";
import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";
import type { StatusTone } from "@/lib/ui/status-tone";
import type { UserDocument } from "@/types/template";

export interface CompanyHistoryRowProps {
  entry: CompanyEntry;
  /** Opens the entry: preview for created documents, the shared view for received ones. */
  onOpen: (entry: CompanyEntry) => void;
  /** PDF export of a created document. */
  onPrint: (document: UserDocument) => void;
}

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Plain status of an entry, from the user's side. */
const statusOf = (entry: CompanyEntry) => {
  if (entry.source === "received") {
    return entry.shared?.locked ? "Signed" : "Received";
  }
  switch (entry.shareStatus) {
    case "signed":
      return "Signed";
    case "viewed":
      return "Viewed";
    case "pending":
      return "Sent";
    case "revoked":
      return "Revoked";
    default:
      return "Not shared";
  }
};

/** The same colour families as the document lists (see `StatusTone`). */
const statusTone: Record<ReturnType<typeof statusOf>, StatusTone> = {
  "Not shared": "grey",
  Received: "teal",
  Revoked: "grey",
  Sent: "golden",
  Signed: "green",
  Viewed: "blue",
};

const iconActionClassName =
  "size-8 min-h-8 text-nox-noir/70 hover:bg-base-100 hover:text-nox-noir";

/**
 * One document in a company page's "Documents" card, styled like the
 * dashboard's grey rows: a white type tile, the title, a muted line "type ·
 * from · date, time", a `StatusPill` in the shared tones (keeping this
 * page's own words, "Sent" and "Revoked") and quiet icon
 * actions (export PDF and edit for created documents, open for received ones).
 * The whole row opens the entry and turns a shade darker on hover.
 */
export const CompanyHistoryRow = ({
  entry,
  onOpen,
  onPrint,
}: CompanyHistoryRowProps) => {
  const TypeIcon = entry.documentType
    ? documentIcons[entry.documentType]
    : FileTextIcon;
  const isReceived = entry.source === "received";
  const status = statusOf(entry);
  const created = new Date(entry.createdAt);
  const { document, shared, title } = entry;
  const from = isReceived ? `From ${entry.sharedBy}` : "By you";

  return (
    <li className="company-history-row group relative flex min-w-0 items-center gap-3 rounded-lg bg-base-200 p-3 transition-colors hover:bg-base-300/60">
      {/* Whole-row target behind the content, so the row can hold its own buttons. */}
      <button
        aria-label={`${isReceived ? "Open" : "Preview"} ${title}`}
        className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nox-noir"
        onClick={() => onOpen(entry)}
        type="button"
      />

      <span className="pointer-events-none relative flex size-10 shrink-0 items-center justify-center rounded-lg bg-base-100 text-nox-noir/70">
        <TypeIcon
          aria-hidden
          size={iconSize.tile}
          weight="bold"
        />
      </span>

      <div className="pointer-events-none relative min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-nox-noir">{title}</p>
        {/* Phones: the icon already says the type, so just who, when and status. */}
        <p className="mt-0.5 truncate text-xs text-nox-noir/70 sm:hidden">
          {isReceived ? `From ${entry.sharedBy} · ` : ""}
          {formatFullDate(entry.createdAt)} ·{" "}
          <span className="font-semibold text-nox-noir">{status}</span>
        </p>
        <p className="mt-0.5 hidden truncate text-xs text-nox-noir/70 sm:block">
          {entry.documentType
            ? getDocumentTypeLabel(entry.documentType)
            : "Document"}{" "}
          · {from} ·{" "}
          <time dateTime={created.toISOString()}>
            {formatFullDate(entry.createdAt)}, {timeFormatter.format(created)}
          </time>
        </p>
      </div>

      <span className="pointer-events-none relative hidden shrink-0 sm:block">
        <StatusPill
          surface="grey"
          tone={statusTone[status]}
        >
          {status}
        </StatusPill>
      </span>

      <div className="relative flex shrink-0 items-center gap-1">
        {document ? (
          <>
            <ButtonIcon
              aria-label={`Export PDF of ${title}`}
              className={`${iconActionClassName} max-sm:hidden`}
              icon={
                <PrinterIcon
                  aria-hidden
                  size={iconSize.control}
                  weight="bold"
                />
              }
              onClick={() => onPrint(document)}
              shape="square"
              size="sm"
              variant="ghost"
            />
            <Link
              aria-label={`Edit ${title}`}
              className={buttonIconClasses({
                className: iconActionClassName,
                shape: "square",
                size: "sm",
                variant: "ghost",
              })}
              href={`/my-documents?edit=${encodeURIComponent(document.id)}`}
            >
              <PencilSimpleIcon
                aria-hidden
                size={iconSize.control}
                weight="bold"
              />
            </Link>
          </>
        ) : shared ? (
          <Link
            aria-label={`Open ${title}`}
            className={buttonIconClasses({
              className: iconActionClassName,
              shape: "square",
              size: "sm",
              variant: "ghost",
            })}
            href={`/my-documents/shared/${encodeURIComponent(shared.id)}`}
          >
            <ArrowSquareOutIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
          </Link>
        ) : null}
      </div>
    </li>
  );
};

export default CompanyHistoryRow;
