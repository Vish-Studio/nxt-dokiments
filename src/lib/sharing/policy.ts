import { normaliseEmail } from "@/lib/sharing/email";
import type { UserRole } from "@/types/auth";
import type { ShareErrorCode } from "@/types/sharing";

/**
 * How many different people each plan may share documents with, in total across
 * all of its documents. `null` means unlimited.
 *
 * Nothing is capped yet. Turning a limit on later is a one-line change here —
 * for instance `free: 2` — because the share route already asks `canShareWith`
 * and the owner's ledger already records every recipient.
 */
export const SHARE_RECIPIENT_LIMIT: Record<UserRole, number | null> = {
  free: null,
  gold: null,
  silver: null,
  special: null,
  superadmin: null,
};

export type CanShareInput = {
  /** The address being shared with, in any casing. */
  email: string;
  /** The sharing account's own address, to refuse sharing with yourself. */
  ownerEmail: string;
  ownerRole: UserRole;
  /** Addresses the owner has already shared with (their ledger). */
  sharedWith: readonly string[];
};

export type CanShareResult =
  | {
      allowed: true;
      /** Distinct people shared with so far, before this share. */
      used: number;
      limit: number | null;
    }
  | {
      allowed: false;
      reason: ShareErrorCode;
      used: number;
      limit: number | null;
    };

/**
 * Decides whether `ownerRole` may share with `email`. The single place sharing
 * rules live — the share route and the share modal both go through it.
 *
 * Re-sharing with someone already in the ledger never counts against the limit.
 *
 * @param input - Who is sharing with whom, and who they have shared with before.
 * @param limits - Per-plan limits; injectable so tests can simulate a cap.
 */
export const canShareWith = (
  input: CanShareInput,
  limits: Record<UserRole, number | null> = SHARE_RECIPIENT_LIMIT,
): CanShareResult => {
  const email = normaliseEmail(input.email);
  const known = new Set(input.sharedWith.map(normaliseEmail));
  const used = known.size;
  const limit = limits[input.ownerRole];

  if (email === normaliseEmail(input.ownerEmail)) {
    return { allowed: false, reason: "SHARE_SELF_NOT_ALLOWED", used, limit };
  }

  if (limit !== null && !known.has(email) && used >= limit) {
    return { allowed: false, reason: "SHARE_LIMIT_REACHED", used, limit };
  }

  return { allowed: true, used, limit };
};
