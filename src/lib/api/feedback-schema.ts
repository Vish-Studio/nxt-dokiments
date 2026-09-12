import "server-only";

import { z } from "zod";

import {
  feedbackTypes,
  MAX_FEEDBACK_MESSAGE,
  MAX_FEEDBACK_PATH,
} from "@/types/feedback";

/**
 * Zod schema for `POST /api/feedback`.
 *
 * In its own module rather than inline in the `route.ts` (as `documents` does with
 * its small `ValuesSchema`) for one reason: a `route.ts` may only export HTTP
 * handlers and route segment config, so a schema declared there is unreachable
 * from a test. The message-length boundary is the part of this feature most worth
 * testing directly, so it has to be importable. Same constraint `promo-schema.ts`
 * and `client-schema.ts` document, arrived at from a different direction.
 */

/**
 * A feedback submission from the browser.
 *
 * `message` is `.trim()`ed here, following `client-schema.ts` rather than
 * `promo-schema.ts`: the trimmed value is what gets stored, so trimming belongs
 * in the schema. Note the ordering — Zod trims *before* checking `min(1)`, so a
 * whitespace-only message is a `400` rather than an empty stored record.
 *
 * `type` is validated against the same `feedbackTypes` array the UI renders from,
 * so a value the toggle can't produce is rejected before it reaches Firestore.
 *
 * `path` is optional because it is diagnostic context the client supplies, not
 * something the user typed — a client that sends none should still have its
 * user's message stored.
 */
export const SubmitFeedbackSchema = z.object({
  message: z.string().trim().min(1).max(MAX_FEEDBACK_MESSAGE),
  path: z.string().trim().max(MAX_FEEDBACK_PATH).optional(),
  type: z.enum(feedbackTypes),
});
