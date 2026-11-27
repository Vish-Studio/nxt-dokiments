import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { cn } from "@/lib/utils";

import {
  companyGroupRowColumns,
  companyGroupSectionClassName,
} from "./company-document-groups";

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
          {/* Mirrors the real header: phones show the name, then the caret and
              "+"; from sm the caret comes first and the avatar shows. */}
          <div className="flex items-center gap-3 rounded-t-xl border-b border-steel-mist/70 bg-base-200/60 py-2.5 pr-2 pl-4 sm:pr-3 sm:pl-3">
            <div className="skeleton size-10 shrink-0 rounded-field max-sm:order-1 sm:size-8" />
            <div className="skeleton size-10 shrink-0 rounded-full max-sm:hidden" />
            <div className="grid flex-1 gap-1.5">
              <div className="skeleton h-4 w-40 rounded-field" />
              <div className="skeleton h-3 w-28 rounded-field" />
            </div>
            <div className="skeleton size-10 shrink-0 rounded-field max-sm:order-2" />
          </div>
          {/* sm+: the column-label row of the real table. */}
          <div
            className={cn(
              "hidden gap-x-4 py-2 pr-2 pl-4 sm:grid",
              companyGroupRowColumns,
            )}
          >
            <div className="skeleton ml-11 h-2.5 w-16 rounded-field" />
            <div className="skeleton h-2.5 w-12 justify-self-end rounded-field" />
            <div className="skeleton hidden h-2.5 w-16 rounded-field lg:block" />
            <div className="skeleton h-2.5 w-12 rounded-field" />
            <div className="skeleton h-2.5 w-12 justify-self-end rounded-field" />
            <div />
          </div>
          {[0, 1, 2].map((row) => (
            <div
              className="border-t border-steel-mist/60"
              key={row}
            >
              {/* Phones: dot, two lines, ⋮ (40px, like the real trigger). */}
              <div className="flex min-h-14 items-center gap-3 py-2 pr-2 pl-4 sm:hidden">
                <div className="skeleton size-2 shrink-0 rounded-full" />
                <div className="grid flex-1 gap-1.5">
                  <div className="skeleton h-3 w-3/5 rounded-field" />
                  <div className="skeleton h-2.5 w-2/5 rounded-field" />
                </div>
                <div className="skeleton size-10 shrink-0 rounded-field" />
              </div>
              {/* sm+: the same columns as the real rows. */}
              <div
                className={cn(
                  "hidden items-center gap-x-4 py-3 pr-2 pl-4 sm:grid",
                  companyGroupRowColumns,
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="skeleton size-8 shrink-0 rounded-field" />
                  <div className="grid flex-1 gap-1.5">
                    <div className="skeleton h-3 w-3/5 rounded-field" />
                    <div className="skeleton h-2.5 w-2/5 rounded-field" />
                  </div>
                </div>
                <div className="skeleton h-3 w-14 justify-self-end rounded-field" />
                <div className="skeleton hidden h-3 w-32 rounded-field lg:block" />
                <div className="grid gap-1">
                  <div className="skeleton h-6 w-24 rounded-full" />
                  <div className="skeleton h-2.5 w-20 rounded-field" />
                </div>
                <div className="skeleton h-3 w-12 justify-self-end rounded-field" />
                <div className="skeleton size-8 rounded-field" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default CompanyDocumentGroupsSkeleton;
