"use client";

import { CaretDownIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

import {
  Dropdown,
  dropdownControlClassName,
} from "@/components/commons/dropdown/dropdown";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { CompanyHistoryRow } from "@/components/dashboard/company-history-row/company-history-row";
import {
  type CompanyEntry,
  countEntriesByType,
} from "@/lib/documents/company-groups";
import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";
import { cn } from "@/lib/utils";
import type { DocumentType, UserDocument } from "@/types/template";

export interface CompanyHistoryListProps {
  className?: string;
  /** The company's display name, for the card's description. */
  companyName: string | null;
  entries: CompanyEntry[];
  /** "New document" with this company prefilled; omitted, no button. */
  newDocumentHref?: string;
  onOpen: (entry: CompanyEntry) => void;
  onPrint: (document: UserDocument) => void;
}

type Source = "all" | "created" | "received";

const sources: { id: Source; label: string }[] = [
  { id: "all", label: "All" },
  { id: "created", label: "Created by you" },
  { id: "received", label: "Shared with you" },
];

/**
 * "Documents" on a company page, in the dashboard's card style ("Continue
 * work"): a titled white card with a one-line explanation, quiet filters (a
 * grey segmented "All / Created by you / Shared with you" control and a
 * document-type dropdown), then one grey {@link CompanyHistoryRow} per
 * document, newest first, in both directions. The card is a flex column and
 * only its list scrolls, so a long history never stretches the page.
 */
export const CompanyHistoryList = ({
  className,
  companyName,
  entries,
  newDocumentHref,
  onOpen,
  onPrint,
}: CompanyHistoryListProps) => {
  const [source, setSource] = useState<Source>("all");
  const [type, setType] = useState<DocumentType | "all">("all");
  const typeCounts = countEntriesByType(entries);
  const visible = entries.filter(
    (entry) =>
      (source === "all" || entry.source === source) &&
      (type === "all" || entry.documentType === type),
  );

  return (
    <section
      aria-label="Documents"
      className={cn(
        "company-history-list flex min-w-0 flex-col rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-title text-xl font-bold text-nox-noir">
            Documents
          </h3>
          <p className="mt-1 text-sm leading-6 text-nox-noir/60">
            {companyName
              ? `Everything you've created for ${companyName} and everything it shared with you, newest first.`
              : "Documents without a client, newest first."}
          </p>
        </div>
        {newDocumentHref ? (
          <LinkButton
            aria-label={
              companyName ? `New document for ${companyName}` : "New document"
            }
            className="w-full shrink-0 whitespace-nowrap sm:w-auto"
            href={newDocumentHref}
            icon={
              <PlusIcon
                aria-hidden
                size={16}
                weight="bold"
              />
            }
            iconPosition="left"
            size="sm"
            variant="primary"
          >
            New document
          </LinkButton>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div
          aria-label="Show documents"
          className="inline-flex gap-1 rounded-field bg-base-200 p-1"
          role="group"
        >
          {sources.map((option) => (
            <button
              aria-pressed={source === option.id}
              className={cn(
                "h-8 rounded-field border px-3 font-title text-xs font-semibold transition-colors",
                source === option.id
                  ? "border-steel-mist bg-base-100 text-nox-noir"
                  : "border-transparent text-nox-noir/55 hover:text-nox-noir",
              )}
              key={option.id}
              onClick={() => setSource(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        {typeCounts.length > 1 ? (
          <Dropdown
            align="end"
            ariaLabel="Document type"
            buttonClassName={cn(
              dropdownControlClassName,
              "h-10 min-h-10 px-3 text-xs",
            )}
            groups={[
              {
                label: "Document type",
                onChange: (value) =>
                  setType(value === "all" ? "all" : (value as DocumentType)),
                options: [
                  { label: `All types (${entries.length})`, value: "all" },
                  ...typeCounts.map(({ count, type: value }) => ({
                    label: `${getDocumentTypeLabel(value)} (${count})`,
                    value,
                  })),
                ],
                value: type,
              },
            ]}
            menuClassName="w-56"
            trigger={
              <>
                {type === "all" ? "All types" : getDocumentTypeLabel(type)}
                <CaretDownIcon
                  aria-hidden
                  size={11}
                />
              </>
            }
          />
        ) : null}
        <p className="ml-auto text-xs text-nox-noir/50">
          {visible.length} of {entries.length}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-box border border-dashed border-steel-mist p-8 text-center text-sm text-nox-noir/55">
          No documents match these filters.
        </p>
      ) : (
        // Only the list scrolls: capped on phones, and on desktop it fills
        // whatever height the card is given (see CompanyDocumentsView).
        <ol
          aria-label="Company documents"
          className="-mr-2 mt-4 grid max-h-[60dvh] min-h-0 min-w-0 flex-1 auto-rows-min grid-cols-1 gap-2 overflow-y-auto overscroll-contain pr-2 lg:max-h-none"
        >
          {visible.map((entry) => (
            <CompanyHistoryRow
              entry={entry}
              key={entry.id}
              onOpen={onOpen}
              onPrint={onPrint}
            />
          ))}
        </ol>
      )}
    </section>
  );
};

export default CompanyHistoryList;
