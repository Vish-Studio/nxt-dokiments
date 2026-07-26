import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import type { MarketplaceTemplate } from "@/types/template";

/** A saved template, hydrated with its full catalog data — the shape `GET /api/saved-templates` returns. */
export type HydratedSavedTemplate = {
  savedAt: number;
  template: MarketplaceTemplate;
  templateId: string;
};

const fetchSavedTemplates = async (): Promise<HydratedSavedTemplate[]> => {
  const response = await fetch("/api/saved-templates");

  if (!response.ok) {
    throw new Error("Unable to load your saved templates.");
  }

  const data = (await response.json()) as { savedTemplates: HydratedSavedTemplate[] };
  return data.savedTemplates;
};

/**
 * The signed-in user's saved-template library, hydrated with full catalog data.
 *
 * Shared by every screen that reads saved templates (Marketplace, My Templates,
 * Dashboard, the document picker) — they all resolve to the same cache entry,
 * so saving or removing a template in one place is reflected in all of them
 * without any explicit cross-component wiring.
 */
export const useSavedTemplatesQuery = () =>
  useQuery({
    queryKey: queryKeys.savedTemplates.all(),
    queryFn: fetchSavedTemplates,
    staleTime: 60_000,
  });

/** Error shape returned by the saved-templates API on a non-2xx response. */
type SavedTemplatesApiError = { error: string };

const postSaveTemplate = async (templateId: string): Promise<{ savedAt: number; templateId: string }> => {
  const response = await fetch("/api/saved-templates", {
    body: JSON.stringify({ templateId }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = (await response.json()) as { savedAt: number; templateId: string } & Partial<SavedTemplatesApiError>;

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to save this template.");
  }

  return data;
};

/**
 * Saves a template to the user's library.
 *
 * Optimistically inserts the template into the cached list immediately (using
 * the full `MarketplaceTemplate` the caller already has in hand — e.g. from
 * the Marketplace grid — so no extra round trip is needed to display it), then
 * reconciles with the server's response. Rolls back to the pre-mutation list
 * on failure (e.g. a 403 tier/limit rejection the server enforces even though
 * the UI also checks it before calling this).
 */
export const useSaveTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: MarketplaceTemplate) => postSaveTemplate(template.id),
    onMutate: async (template) => {
      const key = queryKeys.savedTemplates.all();
      const previous = queryClient.getQueryData<HydratedSavedTemplate[]>(key);

      if (!previous?.some((item) => item.templateId === template.id)) {
        queryClient.setQueryData<HydratedSavedTemplate[]>(key, (current) => [
          ...(current ?? []),
          { savedAt: Date.now(), template, templateId: template.id },
        ]);
      }

      return { previous };
    },
    onError: (_error, _template, context) => {
      queryClient.setQueryData(queryKeys.savedTemplates.all(), context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.savedTemplates.all() });
    },
  });
};

const deleteSavedTemplate = async (templateId: string): Promise<void> => {
  const response = await fetch(`/api/saved-templates/${templateId}`, { method: "DELETE" });

  if (!response.ok) {
    throw new Error("Unable to remove this template.");
  }
};

/**
 * Removes a template from the user's library.
 *
 * Optimistically drops it from the cached list immediately, rolling back on failure.
 */
export const useRemoveSavedTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteSavedTemplate(templateId),
    onMutate: async (templateId) => {
      const key = queryKeys.savedTemplates.all();
      const previous = queryClient.getQueryData<HydratedSavedTemplate[]>(key);

      queryClient.setQueryData<HydratedSavedTemplate[]>(
        key,
        (current) => current?.filter((item) => item.templateId !== templateId) ?? [],
      );

      return { previous };
    },
    onError: (_error, _templateId, context) => {
      queryClient.setQueryData(queryKeys.savedTemplates.all(), context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.savedTemplates.all() });
    },
  });
};
