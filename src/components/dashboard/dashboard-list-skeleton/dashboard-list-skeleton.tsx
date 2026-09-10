import type { ReactNode } from "react";

import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import type { DashboardListColumn } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";

export type DashboardListSkeletonProps = {
  columns: DashboardListColumn[];
  message: string;
  /**
   * One row's shimmer cells. Repeated `count` times — the same element is reused,
   * with keys held by the `DashboardListRow` wrappers.
   */
  row: ReactNode;
  /** Number of placeholder rows. Four fills the panel without implying a real count. */
  count?: number;
  /** Must match the loaded list's own `ordered`, so both render the same element. */
  ordered?: boolean;
};

/**
 * Shimmer placeholder for any `DashboardList`.
 *
 * Renders through the same `DashboardList` and `DashboardListRow` as the loaded
 * list, with the caller's own `columns`, so the container chrome, column header
 * and row height are identical and the list doesn't shift when real rows arrive.
 * Callers define `row` next to their column definition to keep the two in step.
 *
 * The shimmer is `aria-hidden` because it carries no information; `LoadingStatus`
 * is the single announcement screen readers get instead, which is also what the
 * `Loading` stories assert on.
 */
export const DashboardListSkeleton = ({
  columns,
  count = 4,
  message,
  ordered = false,
  row,
}: DashboardListSkeletonProps) => (
  <div className="dashboard-list-skeleton">
    <LoadingStatus message={message} />
    <div aria-hidden>
      <DashboardList
        columns={columns}
        ordered={ordered}
      >
        {Array.from({ length: count }, (_, index) => (
          <DashboardListRow key={index}>{row}</DashboardListRow>
        ))}
      </DashboardList>
    </div>
  </div>
);
