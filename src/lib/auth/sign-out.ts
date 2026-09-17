import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

/**
 * Signs the user out from the browser and navigates away.
 *
 * Shared by the sidebar's "Log out" button and the automatic 1-day expiry in
 * `useSessionTimeout`, so both paths leave exactly the same state behind: no
 * session cookie, no cached session query, and an auth store that reads as
 * signed out.
 *
 * A hard `window.location.assign` rather than a router push is deliberate — it
 * guarantees every cached Server Component payload and in-memory store is
 * dropped, which a client-side navigation would not do.
 *
 * @param queryClient - Active TanStack query client, whose session entry is nulled.
 * @param clearSession - `useAuthStore`'s `clearSession` action.
 * @param redirectTo - Where to land afterwards. Pass `/sign-in?expired=1` to
 *   have the sign-in page explain that the session timed out.
 */
export const signOutAndRedirect = async (
  queryClient: QueryClient,
  clearSession: () => void,
  redirectTo = "/sign-in",
): Promise<void> => {
  try {
    await fetch("/api/auth/sign-out", { method: "POST" });
  } catch {
    // Offline or the request was cut short: fall through and sign out locally
    // anyway. Leaving the user on an authenticated-looking screen would be worse
    // than a cookie that lingers until the server rejects it on the next call.
  }

  queryClient.setQueryData(queryKeys.session(), null);
  clearSession();
  window.location.assign(redirectTo);
};
