import { z } from "zod";

import { parseQuery } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import { listActiveTemplates } from "@/lib/firebase/server-catalog";
import { templateStyleIds } from "@/types/template";

const ListTemplatesQuerySchema = z.object({
  styleId: z.enum(templateStyleIds).optional(),
  tier: z.enum(["free", "silver", "gold"]).optional(),
});

/**
 * `GET /api/templates`
 *
 * Lists the full active marketplace catalog (all styles × all document types),
 * replacing the static `marketplaceTemplates` array previously computed in
 * `src/lib/market-place/index.ts`. Session-gated rather than public — see
 * docs/api-templates-documents.md for why.
 *
 * @returns `{ templates: MarketplaceTemplate[] }` on success, optionally filtered
 *   by the `styleId` and/or `tier` query params.
 * @returns `{ error: string }` with status `400` on an invalid query param.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const GET = withSession(async (request, _context, session) => {
  const url = new URL(request.url);
  const { styleId, tier } = parseQuery(
    url.searchParams,
    ListTemplatesQuerySchema,
  );

  const templates = await listActiveTemplates(session.idToken);
  const filtered = templates.filter(
    (template) =>
      (!styleId || template.style.id === styleId) &&
      (!tier || template.tier === tier),
  );

  return Response.json({ templates: filtered });
});
