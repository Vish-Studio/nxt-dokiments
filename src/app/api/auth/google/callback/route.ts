import { unsealData } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { OAUTH_STATE_COOKIE } from "@/app/api/auth/google/start/route";
import { startSession } from "@/lib/api/session-cookie";
import { signInWithGoogle } from "@/lib/firebase/server-auth";
import { exchangeGoogleCode } from "@/lib/google/server-oauth";
import { PROMO_STATUS_PARAM } from "@/lib/promo/promo-status";
import { redeemPromoCodeAtAuth } from "@/lib/promo/server-auth-promo";
import { sessionOptions } from "@/lib/session";

/** Sealed payload stored in the `dokiments-oauth-state` cookie by the `start` route. */
type OAuthState = {
  /** Sanitised post-sign-in redirect path, e.g. `/dashboard`. */
  next: string;
  /**
   * Promo code the user typed on the auth form before choosing Google, if any.
   *
   * Optional so that a cookie sealed by the previous deployment — mid-flight while
   * this ships — still unseals rather than bouncing the user to the error page.
   */
  promoCode?: string;
  /** CSRF token minted by `start/route.ts`, compared against the `state` query param here. */
  state: string;
};

/** Sign-in page URL to redirect to for any failure in this flow — denied consent, CSRF mismatch, or a downstream Google/Firebase error. */
const SIGN_IN_ERROR_URL = (request: Request) =>
  new URL("/sign-in?error=google_failed", request.url);

/**
 * `GET /api/auth/google/callback`
 *
 * Second leg of the "Sign in with Google" flow. Verifies the CSRF `state`
 * against the sealed cookie set by `start/route.ts`, exchanges the
 * authorization `code` for a Google identity token, signs in (or silently
 * creates) the Firebase account, and writes the session cookie exactly as
 * `POST /api/auth/sign-in` does.
 *
 * If a promo code was sealed into the state cookie by `start/route.ts`, it is
 * redeemed here — once the account exists — and the outcome is appended to the
 * redirect as `?promo=…`, which is how the password flows report it too.
 *
 * @returns A `302` redirect to the original `next` path on success, or to
 *   `/sign-in?error=google_failed` if the user denied consent, the `state`
 *   doesn't match, or any downstream Google/Firebase call fails.
 */
export const GET = async (request: NextRequest): Promise<Response> => {
  const { searchParams } = new URL(request.url);

  // Google appends `?error=...` instead of `?code=...` when the user denies consent.
  if (searchParams.get("error")) {
    return NextResponse.redirect(SIGN_IN_ERROR_URL(request));
  }

  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const sealedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !returnedState || !sealedState) {
    console.error(
      "[google-callback] missing code, state, or oauth-state cookie",
      {
        hasCode: Boolean(code),
        hasCookie: Boolean(sealedState),
        hasReturnedState: Boolean(returnedState),
      },
    );
    return NextResponse.redirect(SIGN_IN_ERROR_URL(request));
  }

  try {
    // Unsealing (rather than trusting the cookie's plaintext) proves the
    // cookie was set by `start/route.ts` and hasn't been tampered with.
    const { next, promoCode, state } = await unsealData<OAuthState>(
      sealedState,
      { password: sessionOptions.password as string },
    );

    // CSRF check: `state` must match what `start/route.ts` minted, or this
    // request didn't originate from the redirect we issued.
    if (state !== returnedState) {
      console.error("[google-callback] state mismatch", {
        returnedState,
        sealedStateValue: state,
      });
      return NextResponse.redirect(SIGN_IN_ERROR_URL(request));
    }

    // Exchange the one-time authorization code for a Google identity token,
    // then hand that to Firebase's signInWithIdp — this creates the Firebase
    // account on first sign-in and reuses it on subsequent ones.
    const { idToken: googleIdToken } = await exchangeGoogleCode(code);
    const sessionData = await signInWithGoogle(googleIdToken);

    // The account exists by now, so a redemption has something to attach to. This
    // never throws — a promo failure must not send a successfully-authenticated
    // user to the error page.
    const promo = await redeemPromoCodeAtAuth(sessionData, promoCode);

    // A redirect has no response body to report the outcome in, so it travels as a
    // query param for `PromoStatusBanner` to render on arrival. The password forms
    // append the same param client-side, so both flows land on one banner.
    const destination = new URL(next, request.url);
    if (promo) destination.searchParams.set(PROMO_STATUS_PARAM, promo);

    const response = NextResponse.redirect(destination);
    // One-time-use cookie: clear it now that the flow it protected is done.
    response.cookies.delete({
      name: OAUTH_STATE_COOKIE,
      path: "/api/auth/google",
    });

    // Same session shape/cookie as the password sign-in route, so downstream
    // code can't tell which flow authenticated the user — including the 1-day
    // deadline `startSession` stamps on.
    await startSession(request, response, sessionData);

    return response;
  } catch (error) {
    console.error("[google-callback] failed", error);
    return NextResponse.redirect(SIGN_IN_ERROR_URL(request));
  }
};
