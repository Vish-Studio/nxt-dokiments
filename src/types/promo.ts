/**
 * One promotional code, as declared in the registry in
 * `src/lib/promo/promo-codes.ts`.
 *
 * `id` — not `code` — is the stable identity: it is the Firestore document ID of
 * a redemption record, so the marketing string can be reworded or have a typo
 * fixed without orphaning every redemption already written against it.
 */
export type PromoCode = {
  /** The code exactly as it should be shown to users, e.g. `ViSHDOK2026!`. Matching is case- and whitespace-insensitive. */
  code: string;
  /** Supporting copy shown under `label` on the sign-in/sign-up pages and the profile card. */
  description: string;
  /** Stable campaign slug, e.g. `launch-2026`. Used as the redemption document ID; never change it for a live campaign. */
  id: string;
  /** Short campaign name shown as a heading, e.g. `Launch Promo`. */
  label: string;
};

/**
 * A record that one account has redeemed one promo code — the shape
 * `GET /api/promo-redemptions` returns.
 *
 * Stored at `users/{uid}/promoRedemptions/{promoId}`, so the presence of a
 * record *is* the "already redeemed" answer and no account can hold two records
 * for the same campaign.
 */
export type PromoRedemption = {
  /** The canonical code from the registry at redemption time, not whatever casing the user typed. */
  code: string;
  /** The redeemed campaign's `PromoCode.id`; also the Firestore document ID. */
  promoId: string;
  /** Epoch-ms redemption time, parsed from the Firestore `redeemedAt` timestamp. */
  redeemedAt: number;
};
