/**
 * Central registry of TanStack Query cache keys.
 *
 * No hook or component should hand-write a key array — importing from here
 * guarantees every consumer of the same resource shares one cache entry, and
 * keeps key hierarchies (e.g. `templates.all()` vs `templates.list(filters)`)
 * consistent for partial invalidation (`invalidateQueries` matches by prefix).
 */
export const queryKeys = {
  /** The current signed-in user's session (`GET /api/auth/me`). */
  session: () => ["session"] as const,

  templates: {
    /** Prefix covering every templates query, list or detail — invalidate this to refetch all of them. */
    all: () => ["templates"] as const,
    /** The active catalog, optionally filtered by style and/or tier. */
    list: (filters?: { styleId?: string; tier?: string }) =>
      ["templates", "list", filters ?? {}] as const,
    /** A single template by ID. */
    detail: (id: string) => ["templates", "detail", id] as const,
  },

  savedTemplates: {
    /** The signed-in user's saved-template library. There is only ever one list — no per-user filters. */
    all: () => ["saved-templates"] as const,
  },

  documents: {
    /** Prefix covering every documents query, list or detail. */
    all: () => ["documents"] as const,
    /** The signed-in user's documents, optionally filtered to one template. */
    list: (templateId?: string) =>
      ["documents", "list", templateId ?? null] as const,
    /** A single document by ID. */
    detail: (id: string) => ["documents", "detail", id] as const,
  },
};
