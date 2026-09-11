import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { clientListColumns } from "@/components/dashboard/client-list/client-list";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";

export type ClientListSkeletonProps = {
  /** Number of placeholder rows. Four fills the panel without implying a real count. */
  count?: number;
  message?: string;
};

/**
 * Shimmer placeholder for `ClientList`, shown while `useClientsQuery` resolves.
 *
 * Renders through the same `DashboardList` with the same `clientListColumns` as the
 * loaded list, so the container chrome and column header are identical and the table
 * doesn't shift when real rows arrive. Each row mirrors `ClientList`'s 12-column
 * grid: avatar, name (plus the mobile-only sub-line), company, the two-line contact
 * block, and the action button.
 *
 * The shimmer is `aria-hidden` because it carries no information; `LoadingStatus`
 * is the single announcement screen readers get instead, which is also what the
 * `Loading` story asserts on.
 */
export const ClientListSkeleton = ({
  count = 4,
  message = "Loading your clients…",
}: ClientListSkeletonProps) => (
  <div className="client-list-skeleton flex min-h-0 w-full flex-1 flex-col">
    <LoadingStatus message={message} />
    <div aria-hidden className="flex min-h-0 flex-1 flex-col">
      <DashboardList columns={clientListColumns}>
        {Array.from({ length: count }, (_, index) => (
          <li
            className="grid gap-4 border-t border-steel-mist/70 p-4 first:border-t-0 sm:grid-cols-12 sm:items-center sm:px-5 sm:first:border-t"
            key={index}
          >
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
              {/* size-10 matches the row's `ButtonIcon size="sm" shape="square"`,
                  which renders 40px — keeps the row height identical. */}
              <div className="skeleton size-10 rounded-field" />
            </div>
          </li>
        ))}
      </DashboardList>
    </div>
  </div>
);
