import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface BentoCellProps {
  /** Background token for the cell, e.g. `bg-play-teal`. */
  accent: string;
  children?: ReactNode;
  className?: string;
  description: string;
  /** Larger type and padding for the cell that anchors the grid. */
  featured?: boolean;
  icon: Icon;
  title: string;
}

export const BentoCell = ({
  accent,
  children,
  className,
  description,
  featured = false,
  icon: IconComponent,
  title,
}: BentoCellProps) => {
  return (
    <article
      className={cn(
        "bento-cell website-card-reveal flex flex-col rounded-box text-nox-noir",
        featured ? "p-8 sm:p-10" : "p-8",
        accent,
        className,
      )}
    >
      <IconComponent
        aria-hidden
        size={featured ? 44 : 36}
        weight="duotone"
      />
      <h3
        className={cn(
          "mt-6 font-title font-bold leading-tight",
          featured ? "text-3xl sm:text-4xl" : "text-2xl",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-3 leading-7 text-nox-noir/72",
          featured ? "max-w-md text-lg leading-8" : "text-base",
        )}
      >
        {description}
      </p>
      {children ? <div className="mt-auto pt-8">{children}</div> : null}
    </article>
  );
};
