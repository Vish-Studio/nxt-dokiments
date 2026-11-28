import { daysAgo } from "@/lib/admin/sample-data";

/**
 * Sample usage for the promo codes in `src/lib/promo/promo-codes.ts`.
 *
 * The campaigns themselves are real (that registry); how often each was used
 * is not, because redemptions live under `users/{uid}/promoRedemptions` and
 * cannot be counted across accounts. A counter document per campaign, bumped by
 * `POST /api/promo-redemptions`, would make this real: replace
 * `getSamplePromoUsage` then.
 */

/** How one campaign has been used. */
export type PromoUsage = {
  /** Redemptions so far. */
  redeemed: number;
  recent: PromoRedemption[];
};

/** One recent redemption. */
export type PromoRedemption = {
  /** Epoch milliseconds. */
  at: number;
  email: string;
  name: string;
};

const usage: Record<string, PromoUsage> = {
  "launch-2026": {
    recent: [
      { at: daysAgo(0, 0.8), email: "jonas@weber.test", name: "Jonas Weber" },
      { at: daysAgo(0, 1.5), email: "elif@demir.test", name: "Elif Demir" },
      { at: daysAgo(0, 11), email: "sam@patel.test", name: "Sam Patel" },
      { at: daysAgo(8), email: "ana@costa.test", name: "Ana Costa" },
    ],
    redeemed: 318,
  },
};

/**
 * Sample usage for one campaign.
 *
 * @param campaignId - The campaign's stable `id` from the promo registry.
 * @returns Its usage, or zero redemptions when the sample has none.
 */
export const getSamplePromoUsage = (campaignId: string): PromoUsage =>
  usage[campaignId] ?? { recent: [], redeemed: 0 };
