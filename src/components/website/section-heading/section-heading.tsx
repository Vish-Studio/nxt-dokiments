import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  align?: "center" | "left";
  className?: string;
  description?: ReactNode;
  eyebrow?: string;
  /** Phrase inside `title` that gets the flat golden highlighter treatment. */
  highlight?: string;
  /** Use `dark` on nox-noir sections so the text flips to white. */
  tone?: "dark" | "light";
  title: string;
}

export const SectionHeading = ({
  align = "left",
  className,
  description,
  eyebrow,
  highlight,
  title,
  tone = "light",
}: SectionHeadingProps) => {
  const isDark = tone === "dark";
  const highlightIndex = highlight ? title.indexOf(highlight) : -1;
  const hasHighlight = highlight !== undefined && highlightIndex >= 0;
  const before = hasHighlight ? title.slice(0, highlightIndex) : title;
  const after = hasHighlight
    ? title.slice(highlightIndex + highlight.length)
    : "";

  return (
    <div
      className={cn(
        "section-heading website-reveal max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "font-title text-sm font-bold uppercase tracking-wide",
            isDark ? "text-white/60" : "text-nox-noir/55",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "mt-3 font-title text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl",
          isDark ? "text-white" : "text-nox-noir",
        )}
      >
        {before}
        {hasHighlight ? (
          <mark className="box-decoration-clone rounded-md bg-golden-harvest px-2 text-nox-noir">
            {highlight}
          </mark>
        ) : null}
        {after}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-6 text-lg leading-8",
            isDark ? "text-white/70" : "text-nox-noir/68",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
};
