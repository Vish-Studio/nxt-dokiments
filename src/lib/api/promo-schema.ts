import "server-only";

import { z } from "zod";

import { MAX_PROMO_CODE } from "@/types/promo";

/**
 * Zod schema for the promo-code routes.
 *
 * Kept in its own module rather than inline in a `route.ts` (as `documents` does
 * with its small `ValuesSchema`) because three routes read this same field —
 * `POST /api/promo-redemptions` plus sign-in and sign-up, which accept an optional
 * promo code alongside the credentials — and a `route.ts` may only export HTTP
 * handlers and route segment config, so the redeem route can't share it by
 * exporting it. Same constraint `client-schema.ts` documents.
 */

/**
 * A promo code as submitted, bounded but otherwise untouched.
 *
 * Deliberately **not** `.trim()`ed here, unlike the fields in `client-schema.ts`.
 * There the trimmed value is what gets stored, so trimming belongs in the schema;
 * here nothing the user typed is ever stored — `findPromoCode` resolves the input
 * to a registry entry and the entry's canonical `code` is what's written. Leaving
 * whitespace intact means all normalisation lives in one tested place
 * (`normalizePromoCode`), and it keeps `"   "` reaching the code lookup so it is
 * answered with "Invalid promo code." rather than a generic "Invalid request body."
 *
 * Exported as a bare field, without `min(1)`, because `auth-schema.ts` reuses it for
 * the optional code the sign-in and sign-up forms carry: those forms submit the
 * field whether or not the user has a code, so an empty string has to be legal
 * there. The redeem route below, where a code is the entire point of the request,
 * adds the minimum back.
 */
export const promoCodeField = z.string().max(MAX_PROMO_CODE);

/** A promo code submitted for redemption, where an empty one is a `400`. */
export const RedeemPromoSchema = z.object({
  promoCode: promoCodeField.min(1),
});
