import { withSuperadmin } from "@/lib/api/with-superadmin";
import { listFeedback } from "@/lib/firebase/server-feedback";

/**
 * `GET /api/admin/feedback`
 *
 * Every feedback submission, most recent first, for the admin Feedback inbox.
 * The route `POST /api/feedback` deferred: it now has its consumer.
 *
 * @returns `{ feedback: FeedbackEntry[] }`.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` for anyone but a superadmin.
 */
export const GET = withSuperadmin(async (_request, _context, session) =>
  Response.json({ feedback: await listFeedback(session) }),
);
