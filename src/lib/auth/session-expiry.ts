/**
 * Isomorphic knowledge of the session-expiry cookie.
 *
 * This lives outside `src/lib/session.ts` on purpose: that module is
 * `server-only`, and the browser needs the cookie name too in order to schedule
 * its own sign-out timer. Nothing secret is involved — the cookie holds a single
 * epoch-ms timestamp — so sharing the name across both runtimes is safe.
 */

/**
 * Readable (non-`HttpOnly`) companion to the sealed `dokiments-session` cookie,
 * holding that session's `absoluteExpiresAt` as a plain epoch-ms string.
 *
 * Treat it as a **display/scheduling hint only**. It is trivially editable by
 * the user, so every authorisation decision must instead read
 * `absoluteExpiresAt` out of the sealed cookie server-side.
 */
export const SESSION_EXPIRY_COOKIE = "dokiments-session-expiry";

/**
 * Reads the current session's hard deadline from `document.cookie`.
 *
 * @returns Epoch-ms deadline, or `null` when the cookie is absent (signed out,
 *   or the browser has already dropped it) or holds an unparseable value.
 */
export const readSessionExpiryDeadline = (): number | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SESSION_EXPIRY_COOKIE}=`));

  if (!match) {
    return null;
  }

  const deadline = Number(match.slice(SESSION_EXPIRY_COOKIE.length + 1));

  return Number.isFinite(deadline) ? deadline : null;
};
