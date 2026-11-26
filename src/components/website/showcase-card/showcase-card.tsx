import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface ShowcaseCardProps {
  /** Background token for the illustration tile, e.g. `bg-play-teal`. */
  accent: string;
  className?: string;
  description: string;
  href: string;
  /** Shown in the illustration tile when there is no `visual`. */
  icon?: Icon;
  linkLabel: string;
  tag?: string;
  title: string;
  /**
   * Replaces the icon with an illustration (for example a real document,
   * `ShowcaseDocument`), clipped to the tile. Decorative: it is `inert` and
   * hidden from assistive tech.
   */
  visual?: ReactNode;
}

export const ShowcaseCard = ({
  accent,
  className,
  description,
  href,
  icon: IconComponent,
  linkLabel,
  tag,
  title,
  visual,
}: ShowcaseCardProps) => {
  return (
    <article
      className={cn(
        "showcase-card website-card-reveal group flex h-full flex-col rounded-box border border-steel-mist bg-white p-3 transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-nox-noir motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-box",
          accent,
        )}
      >
        {visual ? (
          <div
            aria-hidden
            className="absolute inset-0 transition-transform duration-500 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
            inert
          >
            {visual}
          </div>
        ) : IconComponent ? (
          <IconComponent
            aria-hidden
            className="text-nox-noir transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
            size={72}
            weight="duotone"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-6">
        <h3 className="font-title text-xl font-bold text-nox-noir">
          {title}
          {tag ? (
            <span className="ml-2 text-base font-medium text-nox-noir/55">
              {tag}
            </span>
          ) : null}
        </h3>
        <p className="mt-3 text-base leading-7 text-nox-noir/70">
          {description}
        </p>
        <Link
          className="mt-auto inline-flex items-center gap-2 pt-6 font-title font-bold text-nox-noir underline-offset-4 hover:underline"
          href={href}
        >
          {linkLabel}
          <span className="arrow-cta-icon">
            <ArrowRight
              aria-hidden
              size={18}
              weight="bold"
            />
          </span>
        </Link>
      </div>
    </article>
  );
};
