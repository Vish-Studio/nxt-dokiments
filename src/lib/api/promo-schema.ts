import "server-only";

import { z } from "zod";

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
 * Ceiling for a submitted promo code. Far longer than any code we would print;
 * it exists to stop an oversized payload (e.g. a direct Postman request) from
 * reaching the normaliser, not to constrain legitimate use.
 */
const MAX_PROMO_CODE = 64;

/**
 * A promo code submitted for redemption.
 *
 * Deliberately **not** `.trim()`ed here, unlike the fields in `client-schema.ts`.
 * There the trimmed value is what gets stored, so trimming belongs in the schema;
 * here nothing the user typed is ever stored — `findPromoCode` resolves the input
 * to a registry entry and the entry's canonical `code` is what's written. Leaving
 * whitespace intact means all normalisation lives in one tested place
 * (`normalizePromoCode`), and it keeps `"   "` reaching the code lookup so it is
 * answered with "Invalid promo code." rather than a generic "Invalid request body."
 */
export const RedeemPromoSchema = z.object({
  promoCode: z.string().min(1).max(MAX_PROMO_CODE),
});
