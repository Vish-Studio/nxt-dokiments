import "server-only";

import { redeemPromoCode } from "@/lib/firebase/server-promo-redemptions";
import { findPromoCode } from "@/lib/promo/promo-codes";
import type { AuthSession } from "@/types/auth";
import type { PromoStatus } from "@/types/promo";

/**
 * Redeems a promo code submitted alongside credentials, once the account behind it
 * exists.
 *
 * Call this *after* the Firebase account and its Firestore profile have been
 * established and before the response is composed, so the outcome can travel back
 * in the response body. It is deliberately reached from all three authenticating
 * routes — sign-in, sign-up and the Google callback — rather than duplicated in
 * each, so all three report outcomes identically.
 *
 * **This never throws.** A promo code is a marketing extra; whether it applies must
 * have no bearing on whether authentication succeeds. Letting a Firestore failure
 * propagate here would turn a correct password into a `401`, so every failure is
 * reported as `"failed"` and logged instead. The code is still matched
 * server-side — the browser knows the code but never decides the outcome.
 *
 * @param session - The freshly-built session; its `idToken` authorises the write.
 * @param promoCode - Whatever the user typed, if anything.
 * @returns The outcome to report, or `undefined` when no code was submitted — in
 *   which case nothing about promotions is shown, and the flow is exactly as it
 *   was before this feature existed.
 */
export const redeemPromoCodeAtAuth = async (
  session: AuthSession,
  promoCode?: string,
): Promise<PromoStatus | undefined> => {
  // An empty or whitespace-only field is "no code offered", not a wrong code: the
  // input sits on the form whether or not the user has one, so an untouched field
  // must not produce an error.
  if (!promoCode?.trim()) return undefined;

  const promo = findPromoCode(promoCode);

  if (!promo) return "invalid";

  try {
    const result = await redeemPromoCode(session, promo);
    return result.status === "redeemed" ? "applied" : "already_redeemed";
  } catch (error) {
    console.error("[promo] redemption during authentication failed", error);
    return "failed";
  }
};
