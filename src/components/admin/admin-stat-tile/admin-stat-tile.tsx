import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * How a tile's note reads.
 * - `down`: worse than before, in red.
 * - `neutral`: plain context ("Since launch").
 * - `up`: better than before, in green.
 */
export type AdminStatTrend = "down" | "neutral" | "up";

export interface AdminStatTileProps {
  /** Link to the page with the detail behind the number. */
  href?: string;
  label: string;
  /** One short line under the number ("Up 3.2% on last month"). */
  note?: string;
  /** Background of the small corner tile, a play-palette class such as `bg-play-blue`. */
  toneClassName?: string;
  trend?: AdminStatTrend;
  /** The number, already formatted ("12,480"). */
  value: string;
}

const trendClassNames: Record<AdminStatTrend, string> = {
  down: "text-error",
  neutral: "text-nox-noir/60",
  up: "text-success",
};

/**
 * One KPI tile: a label, a big number and an optional note, in the app's
 * bordered card style. A whole-tile link when `href` is set.
 */
export const AdminStatTile = ({
  href,
  label,
  note,
  toneClassName = "bg-base-200",
  trend = "neutral",
  value,
}: AdminStatTileProps) => {
  const content = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className="font-title text-sm font-semibold text-nox-noir/70">{label}</span>
        <span
          aria-hidden
          className={cn("size-8 shrink-0 rounded-field", toneClassName)}
        />
      </span>
      <span className="font-title text-3xl font-bold leading-tight text-nox-noir sm:text-4xl">
        {value}
      </span>
      {note ? (
        <span className={cn("font-title text-xs font-bold", trendClassNames[trend])}>{note}</span>
      ) : null}
    </>
  );

  const className =
    "admin-stat-tile flex min-w-0 flex-col gap-3 rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6";

  return href ? (
    <Link
      className={cn(className, "transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir")}
      href={href}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
};

export default AdminStatTile;
