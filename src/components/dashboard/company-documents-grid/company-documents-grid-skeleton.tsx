import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { companyDocumentsCardClassName } from "@/components/dashboard/company-documents-card/company-documents-card";

import { companyDocumentsGridClassName } from "./company-documents-grid";

export interface CompanyDocumentsGridSkeletonProps {
  count?: number;
}

/**
 * Shimmer stand-in for the "By company" grid while documents load, laid out
 * block for block like `CompanyDocumentsCard` so nothing jumps on arrival.
 */
export const CompanyDocumentsGridSkeleton = ({
  count = 3,
}: CompanyDocumentsGridSkeletonProps) => (
  <div className="company-documents-grid-skeleton">
    <LoadingStatus message="Loading your documents…" />
    <div
      aria-hidden
      className={companyDocumentsGridClassName}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          className={companyDocumentsCardClassName}
          key={index}
        >
          <div className="flex items-center gap-3">
            <div className="skeleton size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton h-4 w-1/2 rounded-field" />
              <div className="skeleton h-3 w-2/3 rounded-field" />
            </div>
          </div>
          <div className="skeleton mt-3 h-3 w-1/3 rounded-field" />
          <div className="mt-3 grid gap-1.5">
            {[0, 1, 2].map((row) => (
              <div
                className="skeleton h-9 rounded-field"
                key={row}
              />
            ))}
          </div>
          <div className="mt-auto flex justify-between pt-4">
            <div className="skeleton h-8 w-24 rounded-field" />
            <div className="skeleton h-8 w-32 rounded-field" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CompanyDocumentsGridSkeleton;
