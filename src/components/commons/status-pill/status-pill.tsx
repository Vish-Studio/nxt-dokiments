import type { ReactNode } from "react";

import { StatusDot } from "@/components/commons/status-dot/status-dot";
import {
  statusPillGreyOnGreyClassName,
  statusPillToneClassName,
  type StatusTone,
} from "@/lib/ui/status-tone";
import { cn } from "@/lib/utils";

export interface StatusPillProps {
  /** The status word, e.g. "Awaiting signature". Kept as direct text. */
  children: ReactNode;
  /**
   * What the pill sits on. `"grey"` for `bg-base-200` rows, so the grey tone
   * switches to a white pill instead of vanishing. Default `"white"`.
   */
  surface?: "grey" | "white";
  /** Which colour family; see {@link StatusTone}. */
  tone: StatusTone;
}

/**
 * A status as a rounded, tinted pill: a small coloured dot, then the word
 * ("● Awaiting signature"). The one status look across the app: wrappers such
 * as `EntryStatusPill` and `ShareStatusBadge` map their status to a tone and
 * a label. Not for tiers or document types, which stay `Badge`s.
 *
 * The dot is decorative; the label stays a direct text child, so text queries
 * and the accessible name are just the word.
 *
 * @example
 * <StatusPill tone="blue">Viewed</StatusPill>
 */
export const StatusPill = ({
  children,
  surface = "white",
  tone,
}: StatusPillProps) => (
  <span
    className={cn(
      "status-pill inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full pl-2 pr-2.5 font-title text-xs font-semibold whitespace-nowrap",
      surface === "grey" && tone === "grey"
        ? statusPillGreyOnGreyClassName
        : statusPillToneClassName[tone],
    )}
  >
    <StatusDot tone={tone} />
    {children}
  </span>
);

export default StatusPill;
