import type { Query } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

/**
 * Resources the dashboard refresh button re-reads. Deliberately excludes the
 * template catalog, session and promo queries so a refresh costs only the
 * user's own data plus notifications.
 */
const refreshableRoots: ReadonlySet<unknown> = new Set([
  queryKeys.documents.all()[0],
  queryKeys.clients.all()[0],
  queryKeys.savedTemplates.all()[0],
  queryKeys.notifications.all()[0],
]);

export const isRefreshableQuery = (query: Pick<Query, "queryKey">) =>
  refreshableRoots.has(query.queryKey[0]);

/** Shared by `invalidateQueries` and `useIsFetching` so both see the same set. */
export const refreshQueryFilter = { predicate: isRefreshableQuery };

/** Time the button stays disabled after a refresh settles. */
export const REFRESH_COOLDOWN_MS = 10_000;
