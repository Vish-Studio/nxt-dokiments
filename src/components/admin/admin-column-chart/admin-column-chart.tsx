import { formatCount } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/** One column of an {@link AdminColumnChart}. */
export interface AdminColumnChartItem {
  /** Axis label under the column ("24/11"). Only some are shown, see `labelEvery`. */
  label: string;
  /** Full description for the hover title and screen readers ("Week of 24/11: 341 sign-ups"). */
  title: string;
  value: number;
}

export interface AdminColumnChartProps {
  /** Highlight the last column, the period still being counted or just finished. */
  highlightLast?: boolean;
  items: readonly AdminColumnChartItem[];
  /** Names the chart for screen readers ("New sign-ups per week"). */
  label: string;
  /** Show every nth axis label so they never collide. Defaults to every label. */
  labelEvery?: number;
}

/**
 * A single-series column chart for counts over time.
 *
 * Columns are list items, each with its value in a hover title and in
 * screen-reader text, so the chart has a text equivalent without a separate
 * table. One colour, with the latest column darker, as a single series needs
 * no legend.
 */
export const AdminColumnChart = ({
  highlightLast = true,
  items,
  label,
  labelEvery = 1,
}: AdminColumnChartProps) => {
  if (items.length === 0) return null;

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <figure className="admin-column-chart grid gap-2">
      <ol
        aria-label={label}
        className="flex h-48 items-end gap-1 border-b border-steel-mist sm:gap-1.5"
      >
        {items.map((item, index) => (
          <li
            className="flex h-full min-w-0 flex-1 items-end"
            key={`${item.label}-${index}`}
            title={item.title}
          >
            <span className="sr-only">{item.title}</span>
            <span
              aria-hidden
              className={cn(
                "block w-full min-h-0.5 rounded-t-[4px]",
                highlightLast && index === items.length - 1 ? "bg-nox-noir" : "bg-play-purple",
              )}
              style={{ height: `${(item.value / max) * 100}%` }}
            />
          </li>
        ))}
      </ol>
      <div
        aria-hidden
        className="flex gap-1 text-[11px] text-nox-noir/55 sm:gap-1.5"
      >
        {items.map((item, index) => (
          <span
            className="min-w-0 flex-1 truncate text-center"
            key={`${item.label}-axis-${index}`}
          >
            {index % labelEvery === 0 ? item.label : ""}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        {label}. Highest: {formatCount(max)}.
      </figcaption>
    </figure>
  );
};

export default AdminColumnChart;
