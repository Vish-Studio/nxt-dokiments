/**
 * Number and date formatting for the admin portal.
 *
 * Formatters are built once at module scope. Dates read dd/mm/yy, as lists do
 * everywhere else in the app.
 */

const numberFormat = new Intl.NumberFormat("en-GB");
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
const dayMonthFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit" });
const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

/** `12480` → `"12,480"`. */
export const formatCount = (value: number): string => numberFormat.format(value);

/**
 * A date as dd/mm/yy.
 *
 * @param value - Epoch milliseconds, or `null` for an unknown date.
 * @returns `"—"` when the date is unknown, so a column never shows "Invalid Date".
 */
export const formatDate = (value: number | null): string =>
  value === null ? "—" : dateFormat.format(value);

/** A date as dd/mm, for chart axes. */
export const formatDayMonth = (value: number): string => dayMonthFormat.format(value);

/** A date and time as "dd/mm/yy, hh:mm". */
export const formatDateTime = (value: number): string =>
  `${dateFormat.format(value)}, ${timeFormat.format(value)}`;

/**
 * A share of a total as a percentage with one decimal.
 *
 * @returns `"0%"` when the total is zero, rather than `NaN%`.
 *
 * @example
 * formatShare(812, 12480); // "6.5%"
 */
export const formatShare = (part: number, total: number): string =>
  total === 0 ? "0%" : `${Math.round((part / total) * 1000) / 10}%`;

/**
 * A change as a signed percentage: `0.041` → `"+4.1%"`, `-0.05` → `"−5%"`.
 *
 * Uses a real minus sign so the column lines up and reads correctly aloud.
 */
export const formatChange = (fraction: number): string => {
  const percent = Math.round(Math.abs(fraction) * 1000) / 10;

  return `${fraction < 0 ? "−" : "+"}${percent}%`;
};

/** `1 account`, `2 accounts`: counts read as English, with the number formatted. */
export const pluralise = (count: number, singular: string, plural = `${singular}s`): string =>
  `${formatCount(count)} ${count === 1 ? singular : plural}`;
