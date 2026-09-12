import type { ReactNode } from "react";

import { Button } from "@/components/commons/button/button";
import { cn } from "@/lib/utils";

export type DashboardListRowProps = {
  children: ReactNode;
  className?: string;
  /**
   * Makes the whole row activatable. Rendered as an overlay button behind the
   * cells rather than by wrapping the row, so the row can still contain its own
   * buttons — nesting interactive elements is invalid HTML.
   *
   * Cells must then opt into the stacking themselves (`relative z-10` plus
   * `pointer-events-none` for display-only cells, `relative z-20` for cells
   * holding their own buttons). Deliberately left to the caller: the row can't
   * know which of its cells are interactive.
   */
  onSelect?: () => void;
  /** Accessible name for the overlay button. Required whenever `onSelect` is passed. */
  selectLabel?: string;
};

/**
 * One row of a `DashboardList`, owning the 12-column grid and divider rules
 * shared by every dashboard list (documents, clients, and their skeletons).
 *
 * Structural only, matching `DashboardList`'s altitude — it knows nothing about
 * what the cells contain.
 */
export const DashboardListRow = ({
  children,
  className,
  onSelect,
  selectLabel,
}: DashboardListRowProps) => (
  <li
    className={cn(
      "dashboard-list-row grid gap-4 border-t border-steel-mist/70 p-4 first:border-t-0 sm:grid-cols-12 sm:items-center sm:px-5 sm:first:border-t",
      onSelect ? "group relative" : null,
      className,
    )}
  >
    {onSelect ? (
      <Button
        aria-label={selectLabel}
        className="absolute inset-0 z-0 h-auto min-h-0 w-full rounded-none border-0 bg-transparent p-0 hover:bg-base-200/65 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nox-noir"
        onClick={onSelect}
        variant="ghost"
      >
        <span className="sr-only">{selectLabel}</span>
      </Button>
    ) : null}

    {children}
  </li>
);
