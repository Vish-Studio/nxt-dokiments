import { formatCount } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/** One row of an {@link AdminBarList}. */
export interface AdminBarListItem {
  label: string;
  /** Text after the value, e.g. a share ("6.5%"). */
  note?: string;
  value: number;
}

export interface AdminBarListProps {
  /** Bar colour; one colour per chart, so magnitude is read from length alone. */
  barClassName?: string;
  items: readonly AdminBarListItem[];
  /** Names the chart for screen readers ("Documents by type"). */
  label: string;
}

/**
 * A horizontal bar chart drawn as a list: label, bar, value.
 *
 * Every value is written next to its bar, so the chart reads without colour
 * and doubles as its own table. Bars scale to the largest value; a zero value
 * keeps a sliver so the row does not look broken.
 */
export const AdminBarList = ({ barClassName = "bg-nox-noir", items, label }: AdminBarListProps) => {
  if (items.length === 0) return null;

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul
      aria-label={label}
      className="admin-bar-list grid gap-3"
    >
      {items.map((item) => (
        <li
          className="grid gap-1.5"
          key={item.label}
        >
          <span className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold text-nox-noir">{item.label}</span>
            <span className="whitespace-nowrap">
              <b className="font-title text-nox-noir">{formatCount(item.value)}</b>
              {item.note ? <span className="text-nox-noir/60"> · {item.note}</span> : null}
            </span>
          </span>
          <span
            aria-hidden
            className="h-2.5 overflow-hidden rounded-full bg-base-200"
          >
            <span
              className={cn("block h-full min-w-1 rounded-full", barClassName)}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
};

export default AdminBarList;
