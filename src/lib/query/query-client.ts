import { QueryCache, QueryClient } from "@tanstack/react-query";

import { signOutAndRedirect } from "@/lib/auth/sign-out";
import { UnauthorizedError } from "@/lib/query/unauthorized-error";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Creates a new `QueryClient` with this app's default cache behaviour.
 *
 * A factory function rather than a module-level singleton — `QueryProvider`
 * calls this inside `useState(() => makeQueryClient())` so exactly one client
 * is created per browser session, without leaking state across the server/client
 * boundary the way a shared module-level instance would in the App Router.
 *
 * Per-resource overrides (e.g. a longer `staleTime` for the admin-managed
 * template catalog) are set on individual `useQuery` calls in `src/hooks/queries/`,
 * not here — these are only the defaults every query starts from.
 */
export const makeQueryClient = () => {
  let isSigningOut = false;

  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      // A 401 from a data endpoint means the server no longer accepts this
      // session (cleared in another tab, expired, revoked). Sign out once rather
      // than letting every mounted query keep polling and failing.
      onError: (error) => {
        if (error instanceof UnauthorizedError && !isSigningOut) {
          isSigningOut = true;
          void signOutAndRedirect(
            queryClient,
            useAuthStore.getState().clearSession,
            "/sign-in?expired=1",
          );
        }
      },
    }),
    defaultOptions: {
      mutations: {
        // Never auto-retry a mutation: a duplicate POST could double-save.
        // A failed mutation should surface to the user, not silently retry.
        retry: 0,
      },
      queries: {
        // One retry for transient network blips; our routes fail fast and
        // predictably (401/403/404 aren't worth retrying).
        // An UnauthorizedError never recovers by retrying.
        retry: (failureCount, error) =>
          !(error instanceof UnauthorizedError) && failureCount < 1,
        // Refetch when the tab regains focus — the main mechanism that
        // catches changes made in another tab or on another device.
        refetchOnWindowFocus: true,
        // How long a query result is considered fresh before a refetch is
        // triggered on next use. 30s default; overridden per-resource.
        staleTime: 30_000,
        // How long an unused query stays in the cache before eviction.
        gcTime: 5 * 60_000,
      },
    },
  });

  return queryClient;
};
