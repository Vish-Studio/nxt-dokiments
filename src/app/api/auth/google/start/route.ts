import { sealData } from "iron-session";
import { NextResponse } from "next/server";

import {
  buildGoogleAuthorizationUrl,
  hasServerGoogleConfig,
} from "@/lib/google/server-oauth";
import { sessionOptions } from "@/lib/session";

/** Cookie holding the sealed `{ state, next }` pair for the duration of the Google redirect round-trip. */
export const OAUTH_STATE_COOKIE = "dokiments-oauth-state";

/**
 * Sanitises the client-supplied `next` redirect target to a same-origin
 * relative path, preventing an open redirect via a crafted `next` value
 * (e.g. `//evil.com` or `https://evil.com`).
 */
const sanitizeNextPath = (next: string | null): string => {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
};

/**
 * `GET /api/auth/google/start`
 *
 * First leg of the "Sign in with Google" flow. Generates a CSRF `state`,
 * seals it together with the sanitised `next` redirect target into a
 * short-lived cookie, then redirects to Google's OAuth 2.0 consent screen.
 *
 * @returns A `302` redirect to Google, or an error redirect to `/sign-in` when Google OAuth is not configured.
 */
export const GET = async (request: Request): Promise<Response> => {
  if (!hasServerGoogleConfig()) {
    console.error(
      "[google-start] GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are not configured",
    );
    return NextResponse.redirect(
      new URL("/sign-in?error=google_failed", request.url),
    );
  }

  const { searchParams } = new URL(request.url);
  const next = sanitizeNextPath(searchParams.get("next"));
  // Random per-request CSRF token; `callback/route.ts` rejects the flow if
  // the `state` Google echoes back doesn't match the one sealed below.
  const state = crypto.randomUUID();

  // Sealing (rather than a plain cookie) stops the client from reading or
  // forging `state`/`next`. 10-minute TTL matches the cookie's `maxAge` —
  // both just need to outlive the Google consent round-trip.
  const sealedState = await sealData(
    { next, state },
    { password: sessionOptions.password as string, ttl: 600 },
  );

  const response = NextResponse.redirect(buildGoogleAuthorizationUrl(state));
  response.cookies.set(OAUTH_STATE_COOKIE, sealedState, {
    httpOnly: true,
    maxAge: 600,
    // Scoped to the OAuth routes only — never sent on unrelated requests.
    path: "/api/auth/google",
    // "lax" (not "strict") because the cookie must still be sent when Google
    // redirects the browser back to `callback/route.ts` cross-site.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
};
