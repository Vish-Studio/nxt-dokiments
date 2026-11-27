import { statusDotToneClassName, type StatusTone } from "@/lib/ui/status-tone";
import { cn } from "@/lib/utils";

export interface StatusDotProps {
  /** Extra classes, e.g. a different size on phone rows. */
  className?: string;
  /** Which colour family; see {@link StatusTone}. */
  tone: StatusTone;
  /** `sm` (6px) inside pills, `md` (8px) on its own beside a status word. */
  size?: "md" | "sm";
}

/**
 * The small coloured circle that marks a status. Decorative (`aria-hidden`):
 * the status word beside it carries the meaning. A hairline ring keeps a
 * golden dot visible on a golden tint.
 */
export const StatusDot = ({ className, size = "sm", tone }: StatusDotProps) => (
  <span
    aria-hidden
    className={cn(
      "status-dot shrink-0 rounded-full ring-1 ring-inset ring-nox-noir/25",
      size === "sm" ? "size-1.5" : "size-2",
      statusDotToneClassName[tone],
      className,
    )}
  />
);

export default StatusDot;
