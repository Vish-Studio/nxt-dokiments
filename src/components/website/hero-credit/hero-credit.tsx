import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  style?: CSSProperties;
}

// Subtle copyright-style credit pinned to the bottom of the hero copy.
export const HeroCredit = ({ className, style }: Props) => {
  return (
    <p
      className={cn(
        "hero-credit flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-nox-noir/45 lg:justify-start",
        className,
      )}
      style={style}
    >
      <span>© {new Date().getFullYear()} Dokiments</span>
      <span aria-hidden>·</span>
      <a
        className="group inline-flex items-center gap-1 transition-colors hover:text-nox-noir"
        href="https://www.vish.studio"
        rel="noreferrer"
        target="_blank"
      >
        A digital product of
        <span className="font-semibold text-nox-noir/65 group-hover:text-nox-noir">
          vish.studio
        </span>
      </a>
    </p>
  );
};

export default HeroCredit;
