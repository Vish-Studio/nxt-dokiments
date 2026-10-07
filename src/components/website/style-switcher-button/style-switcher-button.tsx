import type { BadgeVariant } from "@/components/commons/badge/badge";
import { Badge } from "@/components/commons/badge/badge";
import { cn } from "@/lib/utils";

export interface StyleSwitcherButtonProps {
  className?: string;
  description: string;
  isActive: boolean;
  name: string;
  /** Fires when the active style's autoplay progress bar completes. */
  onProgressEnd?: () => void;
  onSelect: () => void;
  tierLabel: string;
  tierVariant: BadgeVariant;
}

export const StyleSwitcherButton = ({
  className,
  description,
  isActive,
  name,
  onProgressEnd,
  onSelect,
  tierLabel,
  tierVariant,
}: StyleSwitcherButtonProps) => {
  return (
    <button
      aria-pressed={isActive}
      className={cn(
        "style-switcher-button relative w-full rounded-box border p-4 pb-5 text-left transition-colors motion-reduce:transition-none lg:p-5 lg:pb-6",
        isActive
          ? "border-transparent bg-white text-nox-noir"
          : "border-white/15 text-white hover:bg-white/10",
        className,
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between">
        <span className="font-title text-lg font-bold lg:text-xl">{name}</span>
        <Badge
          className={isActive ? undefined : "ring-1 ring-white/25"}
          variant={tierVariant}
        >
          {tierLabel}
        </Badge>
      </span>
      <span
        className={cn(
          "mt-2 hidden text-sm leading-6 lg:block",
          isActive ? "text-nox-noir/70" : "text-white/65",
        )}
      >
        {description}
      </span>
      {isActive ? (
        <span
          aria-hidden
          className="style-switcher-progress absolute inset-x-5 bottom-2 h-0.5 rounded-full bg-nox-noir/50"
          onAnimationEnd={onProgressEnd}
        />
      ) : null}
    </button>
  );
};
