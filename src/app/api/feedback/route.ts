import { ApiError } from "@/lib/api/errors";
import { SubmitFeedbackSchema } from "@/lib/api/feedback-schema";
import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import {
  isFeedbackThrottled,
  readFeedbackThrottle,
  stampFeedbackThrottle,
  submitFeedback,
} from "@/lib/firebase/server-feedback";

/**
 * `POST /api/feedback`
 *
 * Stores one piece of feedback — general or a problem report — from the signed-in
 * account, for an administrator to read.
 *
 * Who the sender is comes entirely from the session: `uid`, `email` and
 * `displayName` are read off `session.user` and the body carries none of them, so
 * feedback cannot be submitted in someone else's name. `firestore.rules` asserts
 * the same thing independently, refusing any record whose `uid` disagrees with the
 * ID token that wrote it.
 *
 * No `hasServerFirebaseConfig` guard, unlike `POST /api/newsletter`: that route is
 * public and can be reached on a misconfigured deployment, whereas nobody can hold
 * a session here unless Firebase Auth was working when they signed in. A Firestore
 * outage still surfaces as a `503`, via `UpstreamUnavailableError` in
 * `handleApiError`.
 *
 * There is no `GET`. Reading submissions is an administrator action, done through
 * the Firebase console at launch; the `listFeedback` helper exists for the deferred
 * admin screen but is not exposed over HTTP yet, because an endpoint with no
 * consumer is an attack surface with no upside.
 *
 * @returns `{ feedback: FeedbackEntry }` with status `201` once stored.
 * @returns `{ error: string }` with status `400` when the body is malformed, the
 *   message is empty or whitespace-only, or it exceeds 2000 characters.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `429` when this account submitted within
 *   the last minute.
 * @returns `{ error: string }` with status `503` when Firestore could not be reached.
 */
export const POST = withSession(async (request, _context, session) => {
  const input = await parseBody(request, SubmitFeedbackSchema);

  // Read before the write, and reused for the stamp afterwards, so the whole
  // throttle costs one read rather than two.
  const throttle = await readFeedbackThrottle(session);

  if (isFeedbackThrottled(throttle)) {
    throw new ApiError(
      429,
      "Thanks — we just received your last message. Please wait a moment before sending another.",
    );
  }

  const feedback = await submitFeedback(session, input);

  // Stamped after the record is safely stored, and its failure deliberately
  // swallowed. By this point the user's message *is* saved, so surfacing an error
  // would tell them it was lost; the worst consequence of an unstamped window is
  // that this account is briefly un-throttled, which is the lesser problem by far.
  await stampFeedbackThrottle(session, throttle).catch((error: unknown) => {
    console.error("Failed to stamp the feedback throttle:", error);
  });

  return Response.json({ feedback }, { status: 201 });
});
