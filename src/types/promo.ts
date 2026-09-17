/**
 * Ceiling for a submitted promo code, in characters. Far longer than any code we
 * would print; it exists to stop an oversized payload (e.g. a direct Postman
 * request) from reaching the normaliser, not to constrain legitimate use.
 *
 * Here rather than in `promo-schema.ts`, which is `server-only`, because the promo
 * inputs on `SignInForm` and `SignUpForm` apply it as `maxLength` so the browser
 * stops at the same place the server does — the pattern `MAX_FEEDBACK_MESSAGE` in
 * `src/types/feedback.ts` follows. `/api/auth/google/start` keeps its own copy of
 * this number for a different reason (a sealed cookie's size limit); see the note
 * there.
 */
export const MAX_PROMO_CODE = 64;

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
 * The outcome of a promo code submitted during sign-in or sign-up, as reported
 * back to the browser and carried to the next page in the `promo` query param.
 *
 * Distinct from `RedeemPromoResult` in `server-promo-redemptions.ts`, which
 * describes only what happened in Firestore. This is the user-facing set, so it
 * also covers the two cases that never reach Firestore: a code that matches no
 * campaign (`invalid`), and one that couldn't be processed at all (`failed`).
 *
 * `failed` exists so a code the user actually typed is never silently dropped.
 * Authentication deliberately succeeds regardless of what happens to the promo
 * code, which means an outage mid-redemption would otherwise sign the user in and
 * say nothing at all about the code they entered.
 */
export const promoStatuses = [
  "already_redeemed",
  "applied",
  "failed",
  "invalid",
] as const;

export type PromoStatus = (typeof promoStatuses)[number];

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
