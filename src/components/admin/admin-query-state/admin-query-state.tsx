import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

import { Button } from "@/components/commons/button/button";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { iconSize } from "@/lib/icons";

export interface AdminQueryStateProps {
  children: ReactNode;
  /** What failed, for the error title ("We couldn't load accounts"). */
  errorTitle: string;
  isError: boolean;
  isPending: boolean;
  /** Read out while loading ("Loading accounts"). */
  loadingMessage: string;
  onRetry: () => void;
}

/**
 * The loading and error states every admin page shares, around its content.
 *
 * Loading shows grey placeholder cards (paired with a screen-reader status, as
 * the app does everywhere); an error shows the app's error `EmptyState` with a
 * retry. The content renders only once data is there.
 */
export const AdminQueryState = ({
  children,
  errorTitle,
  isError,
  isPending,
  loadingMessage,
  onRetry,
}: AdminQueryStateProps) => {
  if (isPending) {
    return (
      <div className="admin-query-state grid gap-4">
        <LoadingStatus message={loadingMessage} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              aria-hidden
              className="h-32 animate-pulse rounded-box bg-base-200"
              key={index}
            />
          ))}
        </div>
        <div
          aria-hidden
          className="h-72 animate-pulse rounded-box bg-base-200"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        action={
          <Button
            icon={<ArrowClockwiseIcon aria-hidden size={iconSize.control} weight="bold" />}
            iconPosition="left"
            onClick={onRetry}
            size="sm"
            variant="primary"
          >
            Try again
          </Button>
        }
        description="Check your connection and try again. If it keeps happening, the Firestore rules may not be deployed yet."
        icon={<WarningCircleIcon aria-hidden size={iconSize.feature} weight="bold" />}
        title={errorTitle}
        tone="error"
      />
    );
  }

  return <>{children}</>;
};

export default AdminQueryState;
