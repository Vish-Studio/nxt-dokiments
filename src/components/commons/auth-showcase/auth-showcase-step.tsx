import { cn } from "@/lib/utils";

export interface AuthShowcaseStepProps {
  controls: string;
  isActive: boolean;
  isPaused: boolean;
  label: string;
  onComplete: () => void;
  onSelect: () => void;
}

/**
 * A stepper tab whose underline doubles as the autoplay timer: the fill runs a
 * CSS animation for the slide duration and advances the carousel when it ends.
 */
export const AuthShowcaseStep = ({
  controls,
  isActive,
  isPaused,
  label,
  onComplete,
  onSelect,
}: AuthShowcaseStepProps) => {
  return (
    <button
      aria-controls={controls}
      aria-selected={isActive}
      className={cn(
        "auth-showcase-step group grid min-w-0 max-w-28 flex-1 gap-2 rounded-field py-2 text-left font-title text-xs font-bold uppercase tracking-normal transition-colors xl:tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir",
        isActive ? "text-nox-noir" : "text-nox-noir/55 hover:text-nox-noir",
      )}
      onClick={onSelect}
      role="tab"
      tabIndex={isActive ? 0 : -1}
      type="button"
    >
      <span className="truncate">{label}</span>
      <span
        aria-hidden
        className="block h-1 overflow-hidden rounded-full bg-nox-noir/15"
      >
        {isActive ? (
          <span
            className="auth-showcase-progress block h-full rounded-full bg-nox-noir"
            data-paused={isPaused}
            onAnimationEnd={onComplete}
          />
        ) : null}
      </span>
    </button>
  );
};
