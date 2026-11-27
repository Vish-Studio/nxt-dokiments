import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export interface HeroHeadlineProps {
  className?: string;
  /** Phrase after `lead` that gets the white highlight. */
  highlight: string;
  lead: string;
  /** Inline style, e.g. `--reveal-delay` for the hero's fade-up. */
  style?: CSSProperties;
}

/**
 * The hero's `h1`: the step's lead, then its highlight in a white mark. Plain,
 * server-rendered text (indexable, read whole by screen readers); the hero
 * fades it up with the rest of the card via `.hero-reveal`.
 */
export const HeroHeadline = ({
  className,
  highlight,
  lead,
  style,
}: HeroHeadlineProps) => (
  <h1
    className={cn("hero-headline", className)}
    style={style}
  >
    {lead}{" "}
    <mark className="whitespace-nowrap rounded-md bg-white px-2 text-nox-noir">
      {highlight}
    </mark>
  </h1>
);

export default HeroHeadline;
