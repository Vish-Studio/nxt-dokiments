/**
 * Marks every admin area that still shows sample data instead of Firestore.
 *
 * The admin portal shipped before some of its data had a home: there is no
 * audit-log collection, no campaign usage counters, and the per-user
 * collections (documents, push devices, shares) cannot be read across accounts
 * with the REST helpers in `server-firestore.ts`. Those areas read typed sample
 * data from `src/lib/admin/<area>/dummy-data.ts`, each behind one getter, so
 * moving an area to Firestore means rewriting that getter and deleting its
 * entry here. The page shows a "Sample data" notice while its key is listed.
 *
 * - `audit`: no audit-log collection yet; admin actions are not recorded.
 * - `documents`: `users/{uid}/documents` is owner-only and needs a collection-group query.
 * - `marketplaceBanner`: the live banner's slides are code in `marketplace-promo-banner.tsx`.
 * - `notifications`: push devices are bearer credentials and stay owner-only.
 * - `planChanges`: role changes are not logged anywhere.
 * - `promotionUsage`: redemptions live under each user; no global counter.
 * - `sharing`: `sharedDocuments` is readable only by its owner and recipients.
 */
export const sampleDataAreas = [
  "audit",
  "documents",
  "marketplaceBanner",
  "notifications",
  "planChanges",
  "promotionUsage",
  "sharing",
] as const;

export type SampleDataArea = (typeof sampleDataAreas)[number];

/** Fixed "today" for every sample, so charts and relative dates never drift between renders. */
export const SAMPLE_NOW = Date.UTC(2026, 10, 28, 9, 40);

const DAY_MS = 86_400_000;

/**
 * A sample timestamp a whole number of days (and optional hours) before {@link SAMPLE_NOW}.
 *
 * @example
 * daysAgo(2, 3); // two days and three hours before the sample "today"
 */
export const daysAgo = (days: number, hours = 0): number =>
  SAMPLE_NOW - days * DAY_MS - hours * 3_600_000;
