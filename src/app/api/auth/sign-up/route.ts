import { handleApiError } from "@/lib/api/errors";
import { startSession } from "@/lib/api/session-cookie";
import { signUpWithFirebase } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import { redeemPromoCodeAtAuth } from "@/lib/promo/server-auth-promo";
import { DEV_SESSION, isDevAuthBypass } from "@/lib/session";
import type { AuthSession } from "@/types/auth";

/**
 * `POST /api/auth/sign-up`
 *
 * Creates a new Firebase account, seeds a Firestore user profile with
 * `role: "free"`, then writes the session payload into an encrypted HttpOnly cookie.
 *
 * Accepts an optional `promoCode`, redeemed once the account exists. Its outcome is
 * reported as `promo` alongside the user and never affects whether the sign-up
 * itself succeeds — see `redeemPromoCodeAtAuth`.
 *
 * @returns `{ user: AuthUser, promo?: PromoStatus }` on success. `promo` is absent
 *   when no code was submitted.
 * @returns `{ error: string }` with status `401` when the email is already in use,
 *   the password is too weak, or any other Firebase error occurs.
 * @returns `{ error: string }` with status `503` when Firebase could not be reached.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const { displayName, email, password, promoCode } =
      (await request.json()) as {
        displayName: string;
        email: string;
        password: string;
        promoCode?: string;
      };

    let sessionData: AuthSession;

    if (isDevAuthBypass()) {
      sessionData = DEV_SESSION;
    } else {
      sessionData = await signUpWithFirebase({ displayName, email, password });
    }

    // Only now that the account and its profile document exist can a redemption be
    // attached to anything. `redeemPromoCodeAtAuth` never throws, so a promo failure
    // cannot undo a sign-up that already succeeded upstream in Firebase.
    const promo = await redeemPromoCodeAtAuth(sessionData, promoCode);

    const response = Response.json({ promo, user: sessionData.user });
    await startSession(request, response, sessionData);

    return response;
  } catch (error) {
    // Firebase was never reached — the email isn't taken and the password isn't weak,
    // so don't report a network outage as a rejected sign-up.
    if (error instanceof UpstreamUnavailableError) {
      return handleApiError(error);
    }

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 401 });
  }
};
