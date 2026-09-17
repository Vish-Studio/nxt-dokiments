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
  /**
   * Unix timestamp (ms) at which this session is force-expired, set once at
   * sign-in and **never** extended — activity does not buy the user more time.
   *
   * Deliberately declared here and *not* on `AuthUser`/`AuthSession`: every
   * token-rotation site assigns a freshly-built `AuthSession` over the session
   * object (`Object.assign(session, updated)`), so keeping this field off that
   * type makes it structurally impossible for a token refresh to reset the
   * deadline. Do not move it to `src/types/auth.ts`.
   */
  absoluteExpiresAt: number;
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
 * Hard ceiling on how long a session may live, measured from sign-in.
 *
 * This is an *absolute* cap, not an idle timeout: refreshing the Firebase
 * `idToken` (or any other activity) extends neither `absoluteExpiresAt` nor
 * this window, so every user re-authenticates at least once a day.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

/**
 * Returns `true` when the session has hit its absolute 1-day deadline and must
 * no longer be honoured.
 *
 * A session with no `absoluteExpiresAt` at all is treated as expired. That
 * covers cookies sealed before this field existed — those users are signed out
 * once on deploy and simply sign in again — and means a partially-populated
 * session can never accidentally pass the check.
 */
export const isSessionExpired = (
  session: Partial<SessionData> | null | undefined,
) => !session?.absoluteExpiresAt || session.absoluteExpiresAt <= Date.now();

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
 *
 * `ttl` caps how long a sealed cookie stays *cryptographically* valid, and
 * `cookieOptions.maxAge` is deliberately omitted so iron-session derives it from
 * `ttl` (`ttl - 60`). Setting `maxAge` explicitly would leave `ttl` on its
 * 14-day default, letting a captured cookie be replayed long after the browser
 * had dropped it. The authoritative deadline is still `absoluteExpiresAt`:
 * `save()` re-seals with a fresh `ttl`, so the seal alone would slide.
 *
 * @see {@link https://github.com/vvo/iron-session}
 */
export const sessionOptions: SessionOptions = {
  cookieName: "dokiments-session",
  cookieOptions: {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  password: process.env.SESSION_SECRET ?? "",
  ttl: SESSION_MAX_AGE_SECONDS,
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
  absoluteExpiresAt: Number.MAX_SAFE_INTEGER,
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
