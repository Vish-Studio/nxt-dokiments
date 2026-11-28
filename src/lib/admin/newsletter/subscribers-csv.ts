import type { NewsletterSubscriber } from "@/types/admin";

/**
 * Quotes one CSV cell, and neutralises spreadsheet formulas.
 *
 * An address is user input from a public form; a value starting with `=`, `+`,
 * `-` or `@` would run as a formula when the export is opened in a spreadsheet,
 * so it gets a leading apostrophe.
 */
const toCell = (value: string): string => {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
};

/**
 * The Newsletter export, as CSV text with a header row.
 *
 * @param subscribers - Rows to export, in the order given.
 * @returns `email,subscribed_at,status` and one line per subscriber; the date
 *   is ISO 8601, or empty when unknown.
 *
 * @example
 * toSubscribersCsv([{ createdAt: 0, email: "a@b.test", id: "x", status: "subscribed" }]);
 * // 'email,subscribed_at,status\n"a@b.test","1970-01-01T00:00:00.000Z","subscribed"'
 */
export const toSubscribersCsv = (subscribers: readonly NewsletterSubscriber[]): string =>
  [
    "email,subscribed_at,status",
    ...subscribers.map((subscriber) =>
      [
        toCell(subscriber.email),
        toCell(subscriber.createdAt === null ? "" : new Date(subscriber.createdAt).toISOString()),
        toCell(subscriber.status),
      ].join(","),
    ),
  ].join("\n");
