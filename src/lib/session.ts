import "server-only";

import type { SessionOptions } from "iron-session";

import type { AuthUser } from "@/types/auth";

/**
 * The shape of the encrypted iron-session cookie payload.
 *
 * Tokens are stored here on the server side only — they are never sent to the
 * browser in plain form. JavaScript cannot read the cookie because it is set
 * with `HttpOnly`.
 */
export type SessionData = {
  /** Unix timestamp (ms) after which the Firebase `idToken` expires. */
  expiresAt: number;
  /** Firebase identity JWT used to authenticate Firestore and Auth API calls. */
  idToken: string;
  /** Firebase long-lived token used to obtain a fresh `idToken` when it expires. */
  refreshToken: string;
  /** Authenticated user profile, persisted here to avoid a Firestore read on every request. */
  user: AuthUser;
};

/**
 * How many milliseconds before `expiresAt` to proactively refresh the token.
 * Refreshing 60 s early prevents edge-case 401s caused by clock skew or
 * network latency between the token check and the actual Firebase API call.
 */
export const REFRESH_SKEW_MS = 60_000;

/**
 * iron-session configuration shared by all Route Handlers and `proxy.ts`.
 *
 * Cookie flags:
 * - `httpOnly` — JavaScript cannot read the cookie, neutralising XSS token theft.
 * - `secure` — HTTPS-only in production; relaxed for `http://localhost` in dev.
 * - `sameSite: "lax"` — the Google sign-in callback lands on this cookie's domain via a
 *   cross-site top-level redirect from `accounts.google.com`; `Strict` cookies are sent
 *   unreliably on that hop across browsers. State-changing routes stay POST-only JSON
 *   (unreachable via a cross-site `<form>` or navigation), and the OAuth callback itself
 *   is CSRF-protected by its own `state` param, so this doesn't reopen a CSRF hole.
 * - `maxAge` — 7-day sliding expiry; the Firebase token is refreshed independently.
 *
 * @see {@link https://github.com/vvo/iron-session}
 */
export const sessionOptions: SessionOptions = {
  cookieName: "dokiments-session",
  cookieOptions: {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  password: process.env.SESSION_SECRET ?? "",
};

/**
 * A hardcoded `SessionData` payload injected when the dev auth bypass is active.
 *
 * Used in place of a real Firebase session so the app can be developed and
 * tested without valid Firebase credentials. Never used in production.
 *
 * @see {@link isDevAuthBypass}
 */
export const DEV_SESSION: SessionData = {
  expiresAt: Number.MAX_SAFE_INTEGER,
  idToken: "dev-auth-bypass-token",
  refreshToken: "dev-auth-bypass-refresh-token",
  user: {
    displayName: "Dev User",
    email: "dev@dokiments.local",
    provider: "password",
    role: "special",
    uid: "dev-auth-bypass-user",
  },
};

/**
 * Returns `true` when the dev auth bypass is enabled.
 *
 * Both conditions must hold to prevent the bypass from accidentally activating
 * in a production build where `DEV_AUTH_BYPASS` is set:
 * - `process.env.DEV_AUTH_BYPASS === "true"`
 * - `process.env.NODE_ENV === "development"`
 */
export const isDevAuthBypass = () =>
  process.env.DEV_AUTH_BYPASS === "true" &&
  process.env.NODE_ENV === "development";
