import { ApiError } from "@/lib/api/errors";
import { RedeemPromoSchema } from "@/lib/api/promo-schema";
import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import {
  listPromoRedemptions,
  redeemPromoCode,
} from "@/lib/firebase/server-promo-redemptions";
import { findPromoCode, promoMessages } from "@/lib/promo/promo-codes";

/**
 * `GET /api/promo-redemptions`
 *
 * Lists the promo codes the signed-in account has redeemed, for the Launch Promo
 * card in Settings. An account that has redeemed nothing returns `[]` — that
 * includes every account created before this feature shipped, which is why no
 * back-fill was needed.
 *
 * Returned as a list rather than a single "has the user redeemed the current
 * promo?" boolean so a second campaign needs no change here; callers pick out the
 * campaign they care about by `promoId`.
 *
 * @returns `{ redemptions: PromoRedemption[] }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `503` when Firestore could not be reached.
 */
export const GET = withSession(async (_request, _context, session) => {
  const redemptions = await listPromoRedemptions(session);
  return Response.json({ redemptions });
});

/**
 * `POST /api/promo-redemptions`
 *
 * Redeems a promo code for the signed-in account, at most once per account ever.
 *
 * The submitted code is matched here rather than trusted from the client: the
 * browser knows the code (it's printed on the sign-in page by design, so it is not
 * a secret) but has no say in whether a redemption is written. Matching is
 * case-insensitive and ignores whitespace — see `normalizePromoCode` for why.
 *
 * The one-per-account rule is enforced at the database, not here: the redemption's
 * document ID is the campaign's own id, and `firestore.rules` grants `create` but
 * neither `update` nor `delete` on that path. This route's own check just turns
 * that into a clear `409` instead of an opaque failure.
 *
 * @returns `{ redemption: PromoRedemption }` with status `201` on a successful redemption.
 * @returns `{ error: string }` with status `400` when the body is malformed, or the
 *   code matches no active promotion.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `409` when this account has already
 *   redeemed the code — including when a concurrent request won the race.
 * @returns `{ error: string }` with status `503` when Firestore could not be reached.
 */
export const POST = withSession(async (request, _context, session) => {
  const { promoCode } = await parseBody(request, RedeemPromoSchema);

  const promo = findPromoCode(promoCode);

  if (!promo) {
    throw new ApiError(400, promoMessages.invalid);
  }

  const result = await redeemPromoCode(session, promo);

  if (result.status === "already_redeemed") {
    throw new ApiError(409, promoMessages.alreadyRedeemed);
  }

  return Response.json({ redemption: result.redemption }, { status: 201 });
});
