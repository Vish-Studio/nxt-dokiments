import { DashboardListSkeleton } from "@/components/dashboard/dashboard-list-skeleton/dashboard-list-skeleton";
import type { DashboardListColumn } from "@/components/dashboard/dashboard-list/dashboard-list";

export interface ClientListSkeletonProps {
  count?: number;
}

export const clientListColumns: DashboardListColumn[] = [
  { className: "col-span-5", label: "Client" },
  { className: "col-span-2", label: "Company" },
  { className: "col-span-3", label: "Contact" },
  { className: "col-span-2 text-right", label: "Actions" },
];

export const clientSkeletonRow = (
  <>
    <div className="flex min-w-0 items-center gap-3 sm:col-span-5">
      <div className="skeleton size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded-field" />
        <div className="skeleton h-3 w-1/2 rounded-field sm:hidden" />
      </div>
    </div>

    <div className="hidden sm:col-span-2 sm:block">
      <div className="skeleton h-3 w-4/5 rounded-field" />
    </div>

    <div className="hidden space-y-2 sm:col-span-3 sm:block">
      <div className="skeleton h-3 w-full rounded-field" />
      <div className="skeleton h-3 w-1/2 rounded-field" />
    </div>

    <div className="flex justify-end sm:col-span-2">
      <div className="skeleton size-10 rounded-field" />
    </div>
  </>
);

/**
 * Table-style loading state for My Clients. It composes the shared dashboard
 * list surface so the skeleton uses the requested headers, row dividers and
 * responsive list behavior.
 */
export const ClientListSkeleton = ({
  count = 4,
}: ClientListSkeletonProps) => (
  <DashboardListSkeleton
    columns={clientListColumns}
    count={count}
    message="Loading your clients…"
    row={clientSkeletonRow}
  />
);

export default ClientListSkeleton;
