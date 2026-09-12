import { SignInSchema } from "@/lib/api/auth-schema";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { startSession } from "@/lib/api/session-cookie";
import { parseBody } from "@/lib/api/validate";
import { signInWithFirebase } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import { redeemPromoCodeAtAuth } from "@/lib/promo/server-auth-promo";
import { DEV_SESSION, isDevAuthBypass } from "@/lib/session";
import type { AuthSession } from "@/types/auth";

/**
 * `POST /api/auth/sign-in`
 *
 * Authenticates the user with email and password via the Firebase Identity
 * Toolkit, then writes the session payload into an encrypted HttpOnly cookie.
 *
 * The Firebase `idToken` and `refreshToken` are stored in the cookie only —
 * the response body contains only the public `AuthUser` object.
 *
 * Accepts an optional `promoCode`, redeemed once the credentials check out. Its
 * outcome is reported as `promo` and never affects whether the sign-in itself
 * succeeds — see `redeemPromoCodeAtAuth`.
 *
 * The body is validated by `SignInSchema`, which deliberately puts **no maximum on
 * `password`** — see `credentialFieldLimits`. An account may hold a password longer
 * than any ceiling we would choose today, and refusing to forward it would lock its
 * owner out permanently rather than merely tidy the request.
 *
 * @returns `{ user: AuthUser, promo?: PromoStatus }` on success. `promo` is absent
 *   when no code was submitted.
 * @returns `{ error: string }` with status `400` when the body fails validation.
 * @returns `{ error: string }` with status `401` on invalid credentials or any Firebase error.
 * @returns `{ error: string }` with status `503` when Firebase could not be reached —
 *   deliberately not a `401`, since unreachable says nothing about the credentials.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const { email, password, promoCode } = await parseBody(
      request,
      SignInSchema,
    );

    let sessionData: AuthSession;

    if (isDevAuthBypass()) {
      sessionData = DEV_SESSION;
    } else {
      sessionData = await signInWithFirebase({ email, password });
    }

    // Redeemed only once the credentials have been accepted, so a promo code can
    // never be applied to an account the caller failed to prove they own.
    const promo = await redeemPromoCodeAtAuth(sessionData, promoCode);

    const response = Response.json({ promo, user: sessionData.user });
    await startSession(request, response, sessionData);

    return response;
  } catch (error) {
    // Neither of these is a judgement on the credentials, which is all the 401 below
    // means. A rejected body is a 400 with a sanitized message; an unreachable
    // Firebase is a 503 — reporting that as a 401 would tell the user their password
    // is wrong during a network outage.
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
