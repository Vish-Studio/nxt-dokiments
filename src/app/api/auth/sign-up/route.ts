import { SignUpSchema } from "@/lib/api/auth-schema";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { startSession } from "@/lib/api/session-cookie";
import { parseBody } from "@/lib/api/validate";
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
 * The body is validated by `SignUpSchema` before Firebase is called. The bound on
 * `displayName` is the part that matters: this route writes it to the Firebase Auth
 * account and to `users/{uid}`, and it is copied from there onto records elsewhere
 * whose Firestore rules assert a ceiling on it.
 *
 * Session handling is hand-rolled rather than using `withSession` for the reasons
 * set out in the `update-profile` route — chiefly that a Firebase rejection is
 * reported as its own status carrying Firebase's message, which `handleApiError`
 * would collapse into a generic `500`.
 *
 * @returns `{ user: AuthUser, promo?: PromoStatus }` on success. `promo` is absent
 *   when no code was submitted.
 * @returns `{ error: string }` with status `400` when the body fails validation.
 * @returns `{ error: string }` with status `401` when the email is already in use,
 *   the password is too weak, or any other Firebase error occurs.
 * @returns `{ error: string }` with status `503` when Firebase could not be reached.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const { displayName, email, password, promoCode } = await parseBody(
      request,
      SignUpSchema,
    );

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
    // Both of these carry their own correct status, and neither is a refused
    // credential — which is all the 401 below means. A rejected body is a 400 with a
    // sanitized message; an unreachable Firebase is a 503, so a network outage isn't
    // reported as an email already taken or a password too weak.
    if (
      error instanceof ApiError ||
      error instanceof UpstreamUnavailableError
    ) {
      return handleApiError(error);
    }

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 401 });
  }
};
