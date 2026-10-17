import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Phrase after `lead` that gets the white highlight. */
  highlight: string;
  lead: string;
  /** Seconds before the first character appears. */
  startDelay: number;
  /** Seconds between characters. */
  stepDelay: number;
}

// Each character is its own span revealed in sequence by CSS, so the full text is server-rendered
// (no flash, still indexable) and the "typing" needs no JavaScript. The heading's accessible name
// comes from aria-label so screen readers read words, not characters.
export const HeroTypedHeadline = ({
  className,
  highlight,
  lead,
  startDelay,
  stepDelay,
}: Props) => {
  const charStyle = (index: number) =>
    ({ animationDelay: `${startDelay + index * stepDelay}s` }) as CSSProperties;
  const typedEnd = startDelay + (lead.length + 1 + highlight.length) * stepDelay;

  return (
    <h1
      aria-label={`${lead} ${highlight}`}
      className={cn("hero-typed-headline", className)}
    >
      <span aria-hidden>
        {Array.from(lead).map((char, index) => (
          <span
            className="hero-type-char"
            key={index}
            style={charStyle(index)}
          >
            {char}
          </span>
        ))}{" "}
        <mark
          className="hero-reveal-fade whitespace-nowrap rounded-md bg-white px-2 text-nox-noir"
          style={charStyle(lead.length + 1)}
        >
          {Array.from(highlight).map((char, index) => (
            <span
              className="hero-type-char"
              key={index}
              style={charStyle(lead.length + 1 + index)}
            >
              {char}
            </span>
          ))}
        </mark>
        <span
          className="hero-type-caret"
          style={{ animationDelay: `${typedEnd}s` } as CSSProperties}
        />
      </span>
    </h1>
  );
};

export default HeroTypedHeadline;
