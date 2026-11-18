const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

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

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (time: number) => {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/**
 * A creation date as people say it: "Today", "Yesterday", "3 days ago" within a
 * week, then "18 Jun" this year or "18 Jun 2025" before that. Used on the
 * company cards, where recency matters more than the exact date.
 *
 * @param time - Epoch ms.
 * @param now - Epoch ms to measure from; defaults to the current time.
 */
export const formatRelativeDate = (time: number, now = Date.now()) => {
  const days = Math.round((startOfDay(now) - startOfDay(time)) / DAY_MS);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(time).getFullYear() === new Date(now).getFullYear()
    ? shortDateFormatter.format(time)
    : fullDateFormatter.format(time);
};

/** "18 Jun 2026": a full, unambiguous date. */
export const formatFullDate = (time: number) => fullDateFormatter.format(time);

/** "Thu 18 Jun, 09:30": the exact moment, for the history timeline. */
export const formatDateTime = (time: number) => dateTimeFormatter.format(time);
