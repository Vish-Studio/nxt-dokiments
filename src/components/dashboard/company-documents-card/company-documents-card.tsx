"use client";

import {
  FileTextIcon,
  PlusIcon,
  UserCircleDashedIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useId } from "react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { getAvatarColorClass } from "@/lib/clients/avatar-color";
import type {
  CompanyDocumentGroup,
  CompanyEntry,
} from "@/lib/documents/company-groups";
import { companyNewDocumentHref } from "@/lib/documents/company-page-href";
import { formatRelativeDate } from "@/lib/documents/format-document-date";
import { documentIcons } from "@/lib/market-place/document-icons";
import { cn } from "@/lib/utils";

export interface CompanyDocumentsCardProps {
  group: CompanyDocumentGroup;
  /** The company page, e.g. `/my-documents/companies/client-123`. */
  href: string;
  /** Opens one recent entry: a preview for created documents, the shared view for received ones. */
  onOpenEntry: (entry: CompanyEntry) => void;
  /** How many recent entries to list. Defaults to 3. */
  recentCount?: number;
}

/**
 * Card shell, shared with `CompanyDocumentsGridSkeleton`. Same surface,
 * padding and border as the My Clients card, so the two pages read as one
 * product.
 */
export const companyDocumentsCardClassName =
  "flex min-h-44 w-full flex-col rounded-box border border-steel-mist bg-base-100 p-4";

const footerLinkClassName =
  "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-field px-3 font-title text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir";

/** Grey `h-8` secondary look ("View client"); turns white while the card is hovered grey. */
const secondaryLinkClassName = cn(
  footerLinkClassName,
  "bg-base-200 text-nox-noir hover:bg-steel-mist/60 group-hover:bg-base-100",
);

/** The card's one black button: the quick action. */
const primaryLinkClassName = cn(
  footerLinkClassName,
  "bg-nox-noir text-white hover:brightness-125",
);

const pluralize = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

/**
 * One company on the My Documents "Companies" tab, laid out like
 * `ClientListItem`:
 *
 * - avatar, name and "5 documents · latest 18 Jun";
 * - a quiet split "4 by you · 1 shared with you";
 * - the most recent documents as grey rows (type tile, title, date; documents
 *   shared with the user carry a "Received" tag), each opening its preview;
 * - footer: grey "View all N" (the company page) and the quick action, a black
 *   "New document" with this company already filled in, because the most common
 *   next step for a client is the next invoice, quote or contract.
 *
 * The "No client yet" group gets a dashed placeholder avatar and border and no
 * "New document" (there is no company to prefill).
 */
export const CompanyDocumentsCard = ({
  group,
  href,
  onOpenEntry,
  recentCount = 3,
}: CompanyDocumentsCardProps) => {
  const headingId = useId();
  const isNoClient = group.name === null;
  const name = group.name ?? "No client yet";
  const count = group.entries.length;
  const recent = group.entries.slice(0, recentCount);

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "company-documents-card group",
        companyDocumentsCardClassName,
        "transition-colors hover:bg-base-200",
        isNoClient && "border-dashed",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {isNoClient ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-steel-mist text-nox-noir/45">
            <UserCircleDashedIcon
              aria-hidden
              size={20}
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
            size="md"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3
            className="truncate font-title text-sm font-bold text-nox-noir"
            id={headingId}
          >
            {name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-nox-noir/50">
            {pluralize(count, "document")} · latest{" "}
            {formatRelativeDate(group.latestAt)}
          </p>
        </div>
      </div>

      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-nox-noir/60">
        <span>
          <span className="font-semibold text-nox-noir">
            {group.createdCount}
          </span>{" "}
          by you
        </span>
        {group.receivedCount > 0 ? (
          <span>
            <span className="font-semibold text-nox-noir">
              {group.receivedCount}
            </span>{" "}
            shared with you
          </span>
        ) : null}
      </p>

      <ul
        aria-label={`Recent documents for ${name}`}
        className="mt-3 grid gap-1.5"
      >
        {recent.map((entry) => {
          const TypeIcon = entry.documentType
            ? documentIcons[entry.documentType]
            : FileTextIcon;
          const isReceived = entry.source === "received";

          return (
            <li key={entry.id}>
              <button
                aria-label={`${isReceived ? "Open" : "Preview"} ${entry.title}`}
                className="flex w-full min-w-0 items-center gap-2.5 rounded-field bg-base-200 px-2 py-1.5 text-left text-xs text-nox-noir/70 transition-colors hover:text-nox-noir focus-visible:outline-2 focus-visible:outline-nox-noir group-hover:bg-base-100"
                onClick={() => onOpenEntry(entry)}
                type="button"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-base-100 text-nox-noir/70 group-hover:bg-base-200">
                  <TypeIcon
                    aria-hidden
                    size={14}
                  />
                </span>
                <span className="min-w-0 truncate font-medium">
                  {entry.title}
                </span>
                {isReceived ? (
                  <span className="shrink-0 rounded-field bg-play-teal/35 px-1.5 font-semibold text-nox-noir">
                    Received
                  </span>
                ) : null}
                <span className="ml-auto shrink-0 pl-1 text-nox-noir/45">
                  {formatRelativeDate(entry.createdAt)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <Link
          aria-label={`View company ${name}`}
          className={secondaryLinkClassName}
          href={href}
        >
          {count > recent.length ? `View all ${count}` : "View company"}
        </Link>
        {isNoClient ? null : (
          <Link
            aria-label={`New document for ${name}`}
            className={primaryLinkClassName}
            href={companyNewDocumentHref(group)}
          >
            <PlusIcon
              aria-hidden
              size={14}
              weight="bold"
            />
            New document
          </Link>
        )}
      </div>
    </article>
  );
};

export default CompanyDocumentsCard;
