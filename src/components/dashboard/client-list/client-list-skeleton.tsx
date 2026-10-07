import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { clientGridClassName } from "@/components/dashboard/client-list/client-list";
import { clientCardClassName } from "@/components/dashboard/client-list-item/client-list-item";

export interface ClientListSkeletonProps {
  count?: number;
}

/** Shimmer stand-in for one `ClientListItem`, laid out block for block. */
const ClientCardSkeleton = () => (
  <div className={clientCardClassName}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="skeleton size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-4 w-2/5 rounded-field" />
          <div className="skeleton h-3 w-3/5 rounded-field" />
        </div>
      </div>
      <div className="skeleton size-8 shrink-0 rounded-field" />
    </div>

    <div className="mt-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="skeleton size-3.5 shrink-0 rounded-sm" />
        <div className="skeleton h-3 w-3/5 rounded-field" />
      </div>
      <div className="flex items-center gap-2">
        <div className="skeleton size-3.5 shrink-0 rounded-sm" />
        <div className="skeleton h-3 w-2/5 rounded-field" />
      </div>
    </div>

    <div className="mt-auto pt-3">
      <div className="skeleton h-8 w-24 rounded-field" />
    </div>
  </div>
);

/**
 * Card-grid loading state for My Clients. It reuses the loaded list's grid and
 * card shell, so nothing shifts when real cards arrive. The shimmer is
 * `aria-hidden`; `LoadingStatus` is the one announcement screen readers get.
 */
export const ClientListSkeleton = ({ count = 6 }: ClientListSkeletonProps) => (
  <div className="client-list-skeleton w-full">
    <LoadingStatus message="Loading your clients…" />
    <div aria-hidden className={clientGridClassName}>
      {Array.from({ length: count }, (_, index) => (
        <ClientCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default ClientListSkeleton;
