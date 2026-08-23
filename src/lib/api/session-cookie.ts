import "server-only";

import { getIronSession } from "iron-session";

import { SESSION_EXPIRY_COOKIE } from "@/lib/auth/session-expiry";
import {
  DEV_SESSION,
  isDevAuthBypass,
  SESSION_MAX_AGE_MS,
  SESSION_MAX_AGE_SECONDS,
  sessionOptions,
  type SessionData,
} from "@/lib/session";
import type { AuthSession } from "@/types/auth";

/**
 * iron-session's own "never expires" sentinel (`computeCookieMaxAge(0)`), reused
 * for the dev auth bypass so a local session is not interrupted.
 */
const NEVER_MAX_AGE = 2_147_483_647;

/**
 * Serialises the readable companion cookie by hand rather than via the `cookie`
 * package — that's a transitive dependency of iron-session, not a direct one,
 * and the only value ever written here is a digit string, so there is nothing
 * to escape.
 */
const expiryCookie = (value: string, maxAge: number) =>
  [
    `${SESSION_EXPIRY_COOKIE}=${value}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    // Deliberately no HttpOnly: `useSessionTimeout` reads this from JavaScript.
    process.env.NODE_ENV === "production" ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");

/** Seconds left until the deadline, floored at 1 so `ttl` is never 0 (= "no expiry" in iron-session). */
const secondsUntil = (absoluteExpiresAt: number) =>
  Math.max(1, Math.ceil((absoluteExpiresAt - Date.now()) / 1000));

/**
 * Opens a brand-new session and starts the 1-day clock.
 *
 * Only the three routes that actually authenticate someone — sign-in, sign-up
 * and the Google callback — may call this, because it is the one place that
 * stamps `absoluteExpiresAt`. Anything that merely rotates Firebase tokens must
 * use {@link saveSession} instead, or it would silently hand the user another
 * full day.
 *
 * Under the dev auth bypass the deadline is pinned to `DEV_SESSION`'s sentinel
 * so local development is never interrupted by a forced sign-out.
 *
 * @param request - Incoming request, read for any existing session cookie.
 * @param response - Response the `Set-Cookie` headers are attached to. Works
 *   with both a plain `Response` and the `NextResponse` used by the OAuth callback.
 * @param data - Freshly-built session from `server-auth.ts`.
 */
export const startSession = async (
  request: Request,
  response: Response,
  data: AuthSession,
): Promise<void> => {
  const isBypass = isDevAuthBypass();
  const absoluteExpiresAt = isBypass
    ? DEV_SESSION.absoluteExpiresAt
    : Date.now() + SESSION_MAX_AGE_MS;
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );

  Object.assign(session, data, { absoluteExpiresAt });

  if (isBypass) {
    // `ttl: 0` disables the seal's expiry entirely, so a bypass session doesn't
    // start failing after a day just because the seal aged out.
    session.updateConfig({ ...sessionOptions, ttl: 0 });
  }

  await session.save();

  response.headers.append(
    "Set-Cookie",
    expiryCookie(
      String(absoluteExpiresAt),
      isBypass ? NEVER_MAX_AGE : SESSION_MAX_AGE_SECONDS,
    ),
  );
};

/**
 * Rewrites an existing session's cookie after Firebase has issued new tokens
 * (token refresh, password change, re-authentication), leaving the 1-day
 * deadline exactly where it was.
 *
 * The seal is re-issued with a `ttl` of only the *remaining* time rather than a
 * fresh `SESSION_MAX_AGE_SECONDS`, so a rotation late in the day cannot leave a
 * cookie that stays cryptographically valid past the deadline.
 *
 * @param data - The rotated session. `absoluteExpiresAt` must be carried over
 *   from the session being replaced — spread it in explicitly at the call site
 *   (`{ ...rotated, absoluteExpiresAt: session.absoluteExpiresAt }`) so the type
 *   checker catches any path that forgets.
 */
export const saveSession = async (
  request: Request,
  response: Response,
  data: SessionData,
): Promise<void> => {
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );

  Object.assign(session, data);
  session.updateConfig({
    ...sessionOptions,
    ttl: secondsUntil(data.absoluteExpiresAt),
  });
  await session.save();
};

/**
 * Signs the user out: drops the sealed session cookie and the readable expiry
 * cookie alongside it. Safe to call when there is no session.
 */
export const destroySession = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );

  session.destroy();
  response.headers.append("Set-Cookie", expiryCookie("", 0));
};
