import { ApiError } from "@/lib/api/errors";
import { withSession } from "@/lib/api/with-session";
import { getTemplateById } from "@/lib/firebase/server-catalog";

type Context = { params: Promise<{ id: string }> };

/**
 * `GET /api/templates/:id`
 *
 * Fetches a single marketplace template by ID, joined with its style. Used to
 * resolve a saved template's or document's `templateId` without pulling the
 * entire catalog over the wire.
 *
 * @returns `{ template: MarketplaceTemplate }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when the template doesn't exist
 *   or is inactive.
 */
export const GET = withSession<Context>(async (_request, context, session) => {
  const { id } = await context.params;
  const template = await getTemplateById(id, session.idToken);

  if (!template) {
    throw new ApiError(404, "Template not found.");
  }

  return Response.json({ template });
});
