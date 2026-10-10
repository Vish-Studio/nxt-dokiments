import { cn } from "@/lib/utils";

interface Props {
  /** One-based position of the active item. */
  current: number;
  total: number;
  className?: string;
  /** What each item is called, for screen readers: "Step 2 of 6", "Slide 2 of 4". */
  label?: string;
}

/**
 * Where the user is in a sequence: pill dots, the active one stretched, and a
 * `2/6` counter. Shared by every carousel and the onboarding tour so position
 * reads the same across the website and the app.
 *
 * The dots are decorative; the counter is what screen readers get, read as
 * "{label} 2 of 6".
 */
export const StepIndicator = ({
  className,
  current,
  label = "Step",
  total,
}: Props) => (
  <div className={cn("step-indicator flex shrink-0 items-center gap-3", className)}>
    <div
      aria-hidden
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          className={cn(
            "h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none",
            index === current - 1 ? "w-6 bg-nox-noir" : "w-1.5 bg-nox-noir/20",
          )}
          key={index}
        />
      ))}
    </div>
    <p className="font-title text-xs font-semibold tabular-nums text-nox-noir/60">
      <span className="sr-only">{label} </span>
      {current}
      <span aria-hidden>/</span>
      <span className="sr-only"> of </span>
      {total}
    </p>
  </div>
);

export default StepIndicator;
