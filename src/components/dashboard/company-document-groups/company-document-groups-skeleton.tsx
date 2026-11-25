import { LoadingStatus } from "@/components/commons/loading-status/loading-status";

import { companyGroupSectionClassName } from "./company-document-groups";

export interface CompanyDocumentGroupsSkeletonProps {
  groups?: number;
}

/**
 * Shimmer stand-in for the Companies tab while documents load, laid out like
 * `CompanyDocumentGroups` (header bar, then rows) so nothing jumps on arrival.
 */
export const CompanyDocumentGroupsSkeleton = ({
  groups = 2,
}: CompanyDocumentGroupsSkeletonProps) => (
  <div className="company-document-groups-skeleton">
    <LoadingStatus message="Loading your documents…" />
    <div
      aria-hidden
      className="grid gap-4"
    >
      {Array.from({ length: groups }, (_, index) => (
        <div
          className={companyGroupSectionClassName}
          key={index}
        >
          <div className="flex items-center gap-3 border-b border-steel-mist/70 bg-base-200/60 px-3 py-2">
            <div className="skeleton size-8 shrink-0 rounded-field" />
            <div className="skeleton size-8 shrink-0 rounded-full" />
            <div className="skeleton h-4 w-40 rounded-field" />
          </div>
          {[0, 1, 2].map((row) => (
            <div
              className="flex items-center gap-3 border-b border-steel-mist/60 px-4 py-3 last:border-b-0"
              key={row}
            >
              <div className="skeleton size-4 shrink-0 rounded-sm" />
              <div className="skeleton h-3 flex-1 rounded-field" />
              <div className="skeleton hidden h-6 w-28 rounded-field sm:block" />
              <div className="skeleton h-3 w-12 rounded-field" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default CompanyDocumentGroupsSkeleton;
