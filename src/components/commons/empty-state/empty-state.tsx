import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Extra classes for the root, for example a different minimum height. */
  className?: string;
  /** One or two short sentences on what will appear here and how. */
  description: ReactNode;
  /** A Phosphor icon at `iconSize.feature`, `aria-hidden`. Optional. */
  icon?: ReactNode;
  /** What is missing ("Nothing shared with you yet"). */
  title: string;
}

/**
 * The dashed placeholder a list shows when it has nothing to show.
 *
 * It grows (`flex-1`) to fill a flex-column parent, so an empty tab ends at
 * the same place a full list would instead of stopping halfway down the page.
 * Its content is one centred group: icon, title, then description, kept
 * together rather than spread over the box.
 *
 * @example
 * <EmptyState
 *   description="Documents other people share with you appear here."
 *   icon={<UsersThreeIcon aria-hidden size={iconSize.feature} weight="bold" />}
 *   title="Nothing shared with you yet"
 * />
 */
export const EmptyState = ({
  className,
  description,
  icon,
  title,
}: EmptyStateProps) => (
  <section
    className={cn(
      "empty-state flex min-h-72 w-full flex-1 flex-col items-center justify-center rounded-box border border-dashed border-steel-mist bg-base-100 p-10 text-center",
      className,
    )}
  >
    {icon ? (
      <span className="mb-4 flex size-12 items-center justify-center rounded-box bg-base-200 text-nox-noir">
        {icon}
      </span>
    ) : null}
    <h2 className="font-title text-base font-bold text-nox-noir">{title}</h2>
    <p className="mt-1 max-w-sm text-sm leading-6 text-nox-noir/60">
      {description}
    </p>
  </section>
);
