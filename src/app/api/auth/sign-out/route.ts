import { destroySession } from "@/lib/api/session-cookie";

/**
 * `POST /api/auth/sign-out`
 *
 * Destroys the iron-session cookie and the readable session-expiry cookie,
 * effectively signing the user out.
 * No Firebase API call is needed — Firebase tokens are stateless JWTs and
 * expire on their own. Revoking refresh tokens server-side would require an
 * Admin SDK call, which is out of scope for the current auth model.
 *
 * @returns `{ ok: true }` always (idempotent — safe to call when already signed out).
 */
export const POST = async (request: Request): Promise<Response> => {
  const response = Response.json({ ok: true });
  await destroySession(request, response);
  return response;
};
