import type { Icon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface Props {
  /** Page tone of the step's dashboard area, e.g. `bg-play-blue` for clients. */
  accent: string;
  className?: string;
  icon: Icon;
  isActive: boolean;
  /** Holds the first autoplay run back a few seconds after page load. */
  isDelayed?: boolean;
  /** Short visible label; `title` is the button's accessible name. */
  label: string;
  onProgressEnd?: () => void;
  onSelect: () => void;
  step: number;
  title: string;
}

// One step of the hero's "how it works" walkthrough as a slim row: icon, then a short label over the
// progress track and step number. The active step is solid white and its track fills as the timer.
export const HeroFeatureTile = ({
  accent,
  className,
  icon: TileIcon,
  isActive,
  isDelayed = false,
  label,
  onProgressEnd,
  onSelect,
  step,
  title,
}: Props) => {
  return (
    <li className={cn("hero-feature-tile min-w-0", className)}>
      <button
        aria-label={title}
        aria-pressed={isActive}
        className={cn(
          "relative flex w-full min-w-0 items-center justify-center gap-2.5 rounded-field p-2 text-left transition-colors motion-reduce:transition-none sm:justify-start",
          isActive ? "bg-white" : "bg-white/45 hover:bg-white/70",
        )}
        onClick={onSelect}
        type="button"
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-nox-noir",
            accent,
          )}
        >
          <TileIcon
            aria-hidden
            size={16}
            weight="bold"
          />
        </span>
        {/* Label over the progress track and step number, together spanning the icon's height.
            Below `sm` only the icon shows; the track keeps running unseen so autoplay still advances. */}
        <span className="grid min-w-0 flex-1 gap-1.5 max-sm:contents">
          <span
            aria-hidden
            className="truncate font-title text-xs font-bold text-nox-noir max-sm:hidden"
          >
            {label}
          </span>
          <span
            aria-hidden
            className="flex items-center gap-2 max-sm:invisible max-sm:absolute max-sm:inset-x-2 max-sm:bottom-1"
          >
            <span className="h-0.5 flex-1 overflow-hidden rounded-full bg-nox-noir/10">
              {isActive ? (
                <span
                  className={cn(
                    "hero-step-progress block h-full bg-nox-noir/50",
                    isDelayed && "hero-step-progress-delayed",
                  )}
                  onAnimationEnd={onProgressEnd}
                />
              ) : null}
            </span>
            <span className="font-title text-[10px] font-bold tabular-nums text-nox-noir/40">
              {String(step).padStart(2, "0")}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
};

export default HeroFeatureTile;
