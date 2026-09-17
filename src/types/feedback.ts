/**
 * What kind of message the user is sending.
 *
 * Two options only. The screens this was modelled on offered "Idea", "Problem"
 * and "Other", but "Other" is a bucket nobody triages, and "Idea" discourages the
 * neutral or positive note that is often the most useful thing a user sends.
 * `"feedback"` covers anything that isn't a fault report, which keeps the toggle
 * readable on a phone and keeps this a dimension worth having in analytics.
 *
 * Stored verbatim as the record's `type` field, and asserted in `firestore.rules`
 * — so adding a third value means changing the rules too, not just this array.
 */
export const feedbackTypes = ["feedback", "problem"] as const;

export type FeedbackType = (typeof feedbackTypes)[number];

/**
 * Ceiling on a submitted message, in characters.
 *
 * Generous enough for a detailed bug report and small enough that no single
 * record can approach Firestore's 1 MiB per-document limit. Lives here rather
 * than in the Zod schema so the client can show a character counter against the
 * same number the server enforces — `feedback-schema.ts` is `server-only` and
 * cannot be imported from a component.
 */
export const MAX_FEEDBACK_MESSAGE = 2000;

/**
 * Ceiling on the captured route, in characters.
 *
 * Our own paths are far shorter; this exists so a hand-rolled request can't use
 * the field as free storage.
 */
export const MAX_FEEDBACK_PATH = 512;

/** The part of a submission that comes from the browser, after validation. */
export type FeedbackInput = {
  /** What the user wrote. Trimmed, 1–{@link MAX_FEEDBACK_MESSAGE} characters. */
  message: string;
  /**
   * Route the user was on when they opened the dialog, e.g. `/my-documents`.
   *
   * The only piece of context captured automatically, because a report like "the
   * export is broken" is unactionable without knowing which screen it came from.
   * Optional so a submission still succeeds if the client omits it.
   */
  path?: string;
  type: FeedbackType;
};

/**
 * One stored submission — the shape `POST /api/feedback` returns and the
 * deferred admin screen will list.
 *
 * `email` and `displayName` are denormalised copies taken from the session at
 * write time, not looked up from `users/{uid}` when read. Whoever reviews a
 * submission should know who sent it without resolving a UID, and a reviewer
 * reading through the Firebase console has no join available to them at all.
 */
export type FeedbackEntry = {
  /** Epoch-ms submission time, parsed from the Firestore `createdAt` timestamp. */
  createdAt: number;
  /** The sender's display name as it stood when they submitted. */
  displayName: string;
  /** The sender's email as it stood when they submitted. */
  email: string;
  /** Firestore document ID, `feedback_{base36 time}_{random}`. */
  id: string;
  message: string;
  /** Route the submission came from, or `""` when the client sent none. */
  path: string;
  type: FeedbackType;
  /** Firebase Auth UID of the sender. Asserted against `request.auth.uid` by the rules. */
  uid: string;
};
