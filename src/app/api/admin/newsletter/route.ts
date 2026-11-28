import { withSuperadmin } from "@/lib/api/with-superadmin";
import { listNewsletterSubscribers } from "@/lib/firebase/server-admin";

/**
 * `GET /api/admin/newsletter`
 *
 * Every newsletter subscriber, newest first. Needs the superadmin `read` rule
 * on `newsletter/{id}` to be deployed; before that Firestore refuses and this
 * answers `500`.
 *
 * @returns `{ subscribers: NewsletterSubscriber[] }`.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` for anyone but a superadmin.
 */
export const GET = withSuperadmin(async (_request, _context, session) =>
  Response.json({ subscribers: await listNewsletterSubscribers(session.idToken) }),
);
