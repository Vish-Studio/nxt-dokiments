import type { AdminStatusTone } from "@/lib/admin/status-tone";

/**
 * Where a shared document, or one of its recipients, stands.
 * - `awaiting`: sent for signature and not signed yet.
 * - `expired`: the link ran out before anyone signed.
 * - `received`: a view link that has been delivered.
 * - `signed`: every signer has signed.
 */
export type ShareActivityStatus = "awaiting" | "expired" | "received" | "signed";

/** Words for each status, in the app's existing wording ("Awaiting signature"). */
export const shareStatusLabels: Record<ShareActivityStatus, string> = {
  awaiting: "Awaiting signature",
  expired: "Expired",
  received: "Received",
  signed: "Signed",
};

/** Pill colour for each status, matching `EntryStatusPill` in the app. */
export const shareStatusTones: Record<ShareActivityStatus, AdminStatusTone> = {
  awaiting: "warning",
  expired: "neutral",
  received: "info",
  signed: "success",
};

/**
 * Sharing tabs.
 * - `all`: every share.
 * - `awaiting`, `signed`: one status each.
 * - `expired`: links that ran out.
 */
export type ShareTab = "all" | "awaiting" | "expired" | "signed";

/**
 * The shares a Sharing tab shows.
 *
 * @param shares - Shares to filter. Not mutated.
 * @param tab - The selected tab.
 */
export const filterSharesByTab = <T extends { status: ShareActivityStatus }>(
  shares: readonly T[],
  tab: ShareTab,
): T[] => (tab === "all" ? [...shares] : shares.filter((share) => share.status === tab));
