const fullDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  weekday: "short",
});

const numericDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

/** "18 Jun 2026": a full, unambiguous date. */
export const formatFullDate = (time: number) => fullDateFormatter.format(time);

/** "Thu 18 Jun, 09:30": the exact moment, for the history timeline. */
export const formatDateTime = (time: number) => dateTimeFormatter.format(time);

/** "18/06/26" (dd/mm/yy): compact and exact, for list columns. */
export const formatNumericDate = (time: number) =>
  numericDateFormatter.format(time);

/** "18/06/26, 09:30": {@link formatNumericDate} plus the time of day. */
export const formatNumericDateTime = (time: number) =>
  `${numericDateFormatter.format(time)}, ${timeFormatter.format(time)}`;
