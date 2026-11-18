"use client";

import { CompanyDocumentsCard } from "@/components/dashboard/company-documents-card/company-documents-card";
import type {
  CompanyDocumentGroup,
  CompanyEntry,
} from "@/lib/documents/company-groups";
import { companyPageHref } from "@/lib/documents/company-page-href";

export interface CompanyDocumentsGridProps {
  groups: CompanyDocumentGroup[];
  onOpenEntry: (entry: CompanyEntry) => void;
}

/** Grid tracks, shared with `CompanyDocumentsGridSkeleton`. Matches the My Clients grid. */
export const companyDocumentsGridClassName =
  "grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3";

/**
 * The My Documents "Companies" tab: one {@link CompanyDocumentsCard} per
 * company, in the order given. Shows a short empty state when search or
 * filters leave no company.
 */
export const CompanyDocumentsGrid = ({
  groups,
  onOpenEntry,
}: CompanyDocumentsGridProps) =>
  groups.length === 0 ? (
    <div className="company-documents-grid grid min-h-48 place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-8 text-center">
      <div>
        <p className="font-title text-base font-bold text-nox-noir">
          No companies match
        </p>
        <p className="mt-1 text-sm text-nox-noir/60">
          Try another search or clear the filters.
        </p>
      </div>
    </div>
  ) : (
    <ul
      aria-label="Companies"
      className={`company-documents-grid ${companyDocumentsGridClassName}`}
    >
      {groups.map((group) => (
        <li
          className="flex min-w-0"
          key={group.key}
        >
          <CompanyDocumentsCard
            group={group}
            href={companyPageHref(group.key)}
            onOpenEntry={onOpenEntry}
          />
        </li>
      ))}
    </ul>
  );

export default CompanyDocumentsGrid;
