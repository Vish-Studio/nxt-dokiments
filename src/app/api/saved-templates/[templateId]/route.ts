import { withSession } from "@/lib/api/with-session";
import { removeSavedTemplate } from "@/lib/firebase/server-saved-templates";

type Context = { params: Promise<{ templateId: string }> };

/**
 * `DELETE /api/saved-templates/:templateId`
 *
 * Removes one template from the authenticated user's library. Ownership is
 * structural — the Firestore path is built from `session.user.uid`, never from
 * anything in the request, so this can only ever affect the caller's own library.
 * Idempotent — removing a template that was never saved is not an error.
 *
 * @returns `204` with an empty body on success (including when it wasn't saved).
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const DELETE = withSession<Context>(
  async (_request, context, session) => {
    const { templateId } = await context.params;
    await removeSavedTemplate(session, templateId);
    return new Response(null, { status: 204 });
  },
);
