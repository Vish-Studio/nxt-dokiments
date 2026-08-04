import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import type {
  MarketplaceTemplate,
  TemplateStyle,
  TemplateStyleId,
  TemplateTier,
} from "@/types/template";

export type TemplatesQueryFilters = {
  styleId?: TemplateStyleId;
  tier?: TemplateTier;
};

/** Response shape of `GET /api/templates` — the active catalog and the active style list. */
export type TemplatesQueryResult = {
  styles: TemplateStyle[];
  templates: MarketplaceTemplate[];
};

const fetchTemplates = async (
  filters?: TemplatesQueryFilters,
): Promise<TemplatesQueryResult> => {
  const params = new URLSearchParams();
  if (filters?.styleId) params.set("styleId", filters.styleId);
  if (filters?.tier) params.set("tier", filters.tier);

  const query = params.toString();
  const response = await fetch(`/api/templates${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error("Unable to load the template catalog.");
  }

  return (await response.json()) as TemplatesQueryResult;
};

/**
 * The active marketplace catalog and style list, replacing the static
 * `marketplaceTemplates`/`templateStyles` arrays previously imported from
 * `@/lib/market-place`.
 *
 * `staleTime` is longer than most other queries in this app — this is
 * admin-managed data that changes far less often than a user's own saved
 * templates or documents, so there's no need to refetch aggressively.
 */
export const useTemplatesQuery = (filters?: TemplatesQueryFilters) =>
  useQuery({
    queryKey: queryKeys.templates.list(filters),
    queryFn: () => fetchTemplates(filters),
    staleTime: 5 * 60_000,
  });
