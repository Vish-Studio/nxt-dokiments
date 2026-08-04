import { z } from "zod";

import { parseQuery } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import {
  listActiveStyles,
  listActiveTemplates,
} from "@/lib/firebase/server-catalog";
import { templateStyleIds } from "@/types/template";

const ListTemplatesQuerySchema = z.object({
  styleId: z.enum(templateStyleIds).optional(),
  tier: z.enum(["free", "silver", "gold"]).optional(),
});

/**
 * `GET /api/templates`
 *
 * Lists the full active marketplace catalog (all styles × all document types)
 * plus the active style list, replacing the static `marketplaceTemplates` and
 * `templateStyles` arrays previously computed in `src/lib/market-place/`.
 * Both are returned together — not as two separate routes — since the
 * Marketplace screen always needs both at once (the style tab bar and the
 * templates within the active tab), and both are server-sorted by `sortOrder`
 * so the tab bar renders in the intended sequence rather than Firestore's
 * arbitrary read order. Session-gated rather than public — see
 * docs/api-templates-documents.md for why.
 *
 * @returns `{ templates: MarketplaceTemplate[], styles: TemplateStyle[] }` on success,
 *   `templates` optionally filtered by the `styleId` and/or `tier` query params.
 *   `styles` is always the full active style list, unfiltered.
 * @returns `{ error: string }` with status `400` on an invalid query param.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const GET = withSession(async (request, _context, session) => {
  const url = new URL(request.url);
  const { styleId, tier } = parseQuery(
    url.searchParams,
    ListTemplatesQuerySchema,
  );

  const [templates, styles] = await Promise.all([
    listActiveTemplates(session.idToken),
    listActiveStyles(session.idToken),
  ]);

  const filtered = templates.filter(
    (template) =>
      (!styleId || template.style.id === styleId) &&
      (!tier || template.tier === tier),
  );

  return Response.json({ styles, templates: filtered });
});
