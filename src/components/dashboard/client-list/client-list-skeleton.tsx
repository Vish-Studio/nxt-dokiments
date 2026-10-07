import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { cn } from "@/lib/utils";

export interface ClientListSkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Card-grid placeholder for My Clients. Its avatar, contact lines and action
 * affordance follow `ClientListItem`, so loading retains the same rhythm as the
 * resolved collection at every breakpoint.
 */
export const ClientListSkeleton = ({
  className,
  count = 6,
}: ClientListSkeletonProps) => (
  <div className="client-list-skeleton w-full">
    <LoadingStatus message="Loading your clients…" />
    <div
      aria-hidden
      className={cn(
        "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <article
          className="flex h-44 flex-col rounded-box border border-steel-mist bg-base-100 p-4"
          key={index}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="skeleton size-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton h-4 w-28 rounded-field" />
                <div className="skeleton h-3 w-20 rounded-field" />
              </div>
            </div>
            <div className="skeleton size-8 shrink-0 rounded-field" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="skeleton h-3 w-4/5 rounded-field" />
            <div className="skeleton h-3 w-3/5 rounded-field" />
          </div>
          <div className="mt-auto pt-3">
            <div className="skeleton h-8 w-24 rounded-field" />
          </div>
        </article>
      ))}
    </div>
  </div>
);

export default ClientListSkeleton;
