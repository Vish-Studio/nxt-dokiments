import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import { getTemplateById } from "@/lib/firebase/server-catalog";
import {
  listSavedTemplates,
  saveTemplate,
} from "@/lib/firebase/server-saved-templates";
import { canUseTier, getSavedTemplateLimit } from "@/lib/market-place";

const SaveTemplateSchema = z.object({
  templateId: z.string().min(1),
});

/**
 * `GET /api/saved-templates`
 *
 * Lists the authenticated user's saved templates, hydrated with each template's
 * full catalog data so `My Templates` and the document picker don't need a
 * second round trip. Templates that no longer exist or were deactivated in the
 * catalog are silently excluded — a saved reference to a removed template
 * shouldn't surface as a broken entry.
 *
 * @returns `{ savedTemplates: Array<{ templateId, savedAt, template }> }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const GET = withSession(async (_request, _context, session) => {
  const saved = await listSavedTemplates(session);

  const hydrated = await Promise.all(
    saved.map(async (item) => {
      const template = await getTemplateById(item.templateId, session.idToken);
      return template
        ? { savedAt: item.savedAt, template, templateId: item.templateId }
        : null;
    }),
  );

  return Response.json({ savedTemplates: hydrated.filter(Boolean) });
});

/**
 * `POST /api/saved-templates`
 *
 * Saves one template to the user's library. Re-validates the tier gate and the
 * free-tier save limit server-side — the client also checks these before calling
 * this route (for UX), but a request made directly (e.g. via Postman) must not be
 * able to bypass either check.
 *
 * @returns `{ templateId, savedAt }` with status `201` on a new save, or `200` if
 *   the template was already saved (idempotent).
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `400` when the request body is malformed.
 * @returns `{ error: string }` with status `403` when the user's plan doesn't unlock
 *   this template's tier, or the free-tier save limit has been reached.
 * @returns `{ error: string }` with status `404` when the template doesn't exist or is inactive.
 */
export const POST = withSession(async (request, _context, session) => {
  const { templateId } = await parseBody(request, SaveTemplateSchema);

  const template = await getTemplateById(templateId, session.idToken);
  if (!template) {
    throw new ApiError(404, "Template not found.");
  }

  if (!canUseTier(session.user.role, template.tier)) {
    throw new ApiError(403, "Your plan does not include this template.");
  }

  const saved = await listSavedTemplates(session);
  const alreadySaved = saved.find((item) => item.templateId === templateId);

  if (!alreadySaved) {
    const limit = getSavedTemplateLimit(session.user.role);
    if (saved.length >= limit) {
      throw new ApiError(403, "You've reached your saved template limit.");
    }
  }

  const result = await saveTemplate(session, templateId);
  return Response.json(result, { status: alreadySaved ? 200 : 201 });
});
