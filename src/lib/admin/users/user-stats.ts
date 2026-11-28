import type { AdminUserAccount } from "@/types/admin";
import type { UserRole } from "@/types/auth";
import { userRoles } from "@/types/auth";

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

/** One week of sign-ups, for the Overview chart. */
export type WeeklySignups = {
  count: number;
  /** Epoch milliseconds at the start (inclusive) of the 7-day window. */
  weekStart: number;
};

/** How the Users list can be narrowed and ordered. */
export type AccountFilters = {
  /** A role to keep, or `"all"`. */
  role: UserRole | "all";
  /** Free text matched against name, email, company and UID, case-insensitively. */
  search: string;
  sort: AccountSort;
};

/**
 * Users list orderings.
 * - `name`: A to Z by display name.
 * - `newest`: most recently created first; accounts with no `createdAt` last.
 * - `oldest`: earliest created first; accounts with no `createdAt` last.
 */
export type AccountSort = "name" | "newest" | "oldest";

/**
 * How many accounts are on each role.
 *
 * Every role is present in the result, at `0` when nobody holds it, so a chart
 * keeps the same rows whatever the data.
 *
 * @param accounts - Accounts to count.
 * @returns A count per role.
 */
export const countByRole = (
  accounts: readonly Pick<AdminUserAccount, "role">[],
): Record<UserRole, number> => {
  const counts = Object.fromEntries(userRoles.map((role) => [role, 0])) as Record<
    UserRole,
    number
  >;

  for (const account of accounts) counts[account.role] += 1;

  return counts;
};

/**
 * Paying accounts: Silver and Gold.
 *
 * Special is a complimentary plan and superadmins are staff, so neither counts
 * as a subscriber even though both unlock every template.
 */
export const countPaidAccounts = (
  accounts: readonly Pick<AdminUserAccount, "role">[],
): number =>
  accounts.filter((account) => account.role === "silver" || account.role === "gold")
    .length;

/**
 * How many accounts were created at or after a moment.
 *
 * @param accounts - Accounts to check.
 * @param since - Epoch milliseconds; accounts with no `createdAt` never count.
 */
export const countJoinedSince = (
  accounts: readonly Pick<AdminUserAccount, "createdAt">[],
  since: number,
): number =>
  accounts.filter((account) => account.createdAt !== null && account.createdAt >= since)
    .length;

/**
 * Sign-ups per week for the last `weeks` weeks, oldest first, ending at `now`.
 *
 * Windows are rolling 7-day blocks counted back from `now` rather than calendar
 * weeks, so the last bar is always a full week and never a half-empty Monday.
 *
 * @param accounts - Accounts to bucket; those with no `createdAt` are skipped.
 * @param now - Epoch milliseconds the last window ends at.
 * @param weeks - How many windows to return.
 * @returns Exactly `weeks` entries, empty weeks at `0`.
 *
 * @example
 * weeklySignups(accounts, Date.now(), 12).at(-1)?.count; // sign-ups in the last 7 days
 */
export const weeklySignups = (
  accounts: readonly Pick<AdminUserAccount, "createdAt">[],
  now: number,
  weeks: number,
): WeeklySignups[] => {
  const firstStart = now - weeks * WEEK_MS;
  const buckets = Array.from({ length: weeks }, (_, index) => ({
    count: 0,
    weekStart: firstStart + index * WEEK_MS,
  }));

  for (const { createdAt } of accounts) {
    if (createdAt === null || createdAt < firstStart || createdAt >= now) continue;

    buckets[Math.floor((createdAt - firstStart) / WEEK_MS)].count += 1;
  }

  return buckets;
};

const compareCreatedAt = (
  a: Pick<AdminUserAccount, "createdAt">,
  b: Pick<AdminUserAccount, "createdAt">,
  direction: 1 | -1,
) => {
  // Profiles without a creation date are the oldest real accounts, but their age
  // is unknown, so they sink to the end in both directions instead of guessing.
  if (a.createdAt === null) return b.createdAt === null ? 0 : 1;
  if (b.createdAt === null) return -1;

  return (a.createdAt - b.createdAt) * direction;
};

/**
 * The Users list after search, role filter and sort.
 *
 * @param accounts - Every account, in any order. Not mutated.
 * @param filters - What the toolbar is set to.
 * @returns A new array.
 */
export const filterAccounts = (
  accounts: readonly AdminUserAccount[],
  { role, search, sort }: AccountFilters,
): AdminUserAccount[] => {
  const query = search.trim().toLowerCase();

  const matches = accounts.filter((account) => {
    if (role !== "all" && account.role !== role) return false;
    if (!query) return true;

    return [account.displayName, account.email, account.companyName ?? "", account.uid]
      .some((value) => value.toLowerCase().includes(query));
  });

  if (sort === "name") {
    return matches.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  return matches.sort((a, b) => compareCreatedAt(a, b, sort === "newest" ? -1 : 1));
};
