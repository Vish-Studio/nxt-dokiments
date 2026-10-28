import { ApiError, handleApiError } from "@/lib/api/errors";
import { withSession } from "@/lib/api/with-session";
import { readEmailVerified } from "@/lib/firebase/id-token";
import { sendAccountVerificationEmail } from "@/lib/firebase/server-auth";
import { FirebaseRateLimitedError } from "@/lib/firebase/server-identity";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import { isDevAuthBypass } from "@/lib/session";

/**
 * `POST /api/auth/send-verification`
 *
 * Sends (or re-sends) the Firebase verification email to the signed-in user's
 * address. Backs the Resend action on the "Verify your email" notice.
 *
 * Already-verified accounts get `204` and nothing is sent, so the route can be
 * called without first asking whether it is needed. Verification is read from the
 * ID token's `email_verified` claim, which is at most an hour stale; the worst case
 * is one redundant email for someone who verified moments ago.
 *
 * There is no server-side cooldown. A cookie-held timestamp is replayable, so it
 * would only look like a limit — Firebase's own throttle is the real one, and is
 * reported as `429`. The notice enforces a visible cooldown on the client.
 *
 * @returns `204` with no body when the email was sent, or the account is already
 *   verified.
 * @returns `{ error: string }` with status `429` when Firebase is throttling this
 *   account.
 * @returns `{ error: string }` with status `400` when Firebase rejects the request.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `503` when Firebase could not be reached.
 */
export const POST = withSession(async (_request, _context, session) => {
  if (isDevAuthBypass() || readEmailVerified(session.idToken)) {
    return new Response(null, { status: 204 });
  }

  try {
    await sendAccountVerificationEmail(session.idToken);
  } catch (error) {
    if (error instanceof FirebaseRateLimitedError) {
      return Response.json({ error: error.message }, { status: 429 });
    }

    if (error instanceof UpstreamUnavailableError) {
      return handleApiError(error);
    }

    // Firebase refusing the request: its mapped message is safe to show, and
    // `withSession` would otherwise collapse it into a generic 500.
    throw new ApiError(
      400,
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.",
    );
  }

  return new Response(null, { status: 204 });
});
