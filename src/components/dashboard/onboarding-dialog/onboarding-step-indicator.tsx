import { cn } from "@/lib/utils";

export interface OnboardingStepIndicatorProps {
  activeIndex: number;
  total: number;
}

/**
 * Where the user is in the tour: progress dots and a `1/3` counter. The dots are
 * decorative; the counter reads as "Step 1 of 3" to screen readers.
 */
export const OnboardingStepIndicator = ({
  activeIndex,
  total,
}: OnboardingStepIndicatorProps) => (
  <div className="onboarding-step-indicator flex items-center gap-3">
    <div
      aria-hidden
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          className={cn(
            "h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none",
            index === activeIndex ? "w-6 bg-nox-noir" : "w-1.5 bg-nox-noir/20",
          )}
          key={index}
        />
      ))}
    </div>
    <p className="font-title text-xs font-semibold tabular-nums text-nox-noir/60">
      <span className="sr-only">Step </span>
      {activeIndex + 1}
      <span aria-hidden>/</span>
      <span className="sr-only"> of </span>
      {total}
    </p>
  </div>
);
