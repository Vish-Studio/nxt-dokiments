import type { Icon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface Props {
  /** Background token for the icon tile, e.g. `bg-play-blue`. */
  accent: string;
  className?: string;
  icon: Icon;
  label: string;
}

// Compact label pinned on the hero photo: a pastel icon tile and one short line.
export const HeroPill = ({ accent, className, icon: PillIcon, label }: Props) => {
  return (
    <span
      className={cn(
        "hero-pill inline-flex items-center gap-2 whitespace-nowrap rounded-field border border-nox-noir/10 bg-white py-1.5 pl-1.5 pr-3 font-title text-xs font-semibold text-nox-noir",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-md text-nox-noir",
          accent,
        )}
      >
        <PillIcon
          aria-hidden
          size={14}
          weight="bold"
        />
      </span>
      {label}
    </span>
  );
};

export default HeroPill;
