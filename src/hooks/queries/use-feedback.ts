import { useMutation } from "@tanstack/react-query";

import { trackEvent } from "@/lib/analytics/track";
import type { FeedbackEntry, FeedbackInput } from "@/types/feedback";

/** Error shape returned by the feedback API on a non-2xx response. */
type FeedbackApiError = { error: string };

/**
 * Thrown when the server refuses a submission because this account sent one
 * within the last minute.
 *
 * A distinct type so the dialog can present it as the mild notice it is — "we
 * already have your last message" — rather than in the red of a genuine failure.
 * Nothing was lost and nothing is broken; the only correct response is to wait.
 *
 * Mirrors `PromoRedemptionError` and `ReauthRequiredError`: the established way
 * this codebase gives one specific server rejection its own catchable type.
 */
export class FeedbackThrottledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackThrottledError";
  }
}

const postFeedback = async (input: FeedbackInput): Promise<FeedbackEntry> => {
  const response = await fetch("/api/feedback", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = (await response.json()) as {
    feedback: FeedbackEntry;
  } & Partial<FeedbackApiError>;

  if (!response.ok) {
    // Classified by status rather than by a code in the body, following
    // `postRedeemPromoCode`: `429` is already this route's documented contract, so
    // there is nothing extra for client and server to agree on. The server composes
    // the wording, so the copy lives in one place.
    if (response.status === 429) {
      throw new FeedbackThrottledError(
        data.error ?? "Please wait a moment before sending more.",
      );
    }

    throw new Error(data.error ?? "Unable to send your feedback right now.");
  }

  return data.feedback;
};

/**
 * Sends one piece of feedback for the signed-in user.
 *
 * No cache to touch — there is no read path for feedback in the app, so this
 * invalidates nothing and writes nothing back. That is why it takes no
 * `queryClient`, unlike every other mutation in this folder. When the deferred
 * admin screen lands it will bring its own query, and this hook still won't need
 * to invalidate it: an administrator is not the person who just submitted.
 *
 * Analytics fire on success only, so the count reflects feedback we actually
 * hold. A throttled or failed attempt is not a submission.
 */
export const useSubmitFeedbackMutation = () =>
  useMutation({
    mutationFn: postFeedback,
    onSuccess: (feedback) => {
      trackEvent("feedback_submitted", { feedback_type: feedback.type });
    },
  });
