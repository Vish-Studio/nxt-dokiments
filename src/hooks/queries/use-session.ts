import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import type { AuthUser } from "@/types/auth";

/**
 * Fetches the current session from `GET /api/auth/me`.
 *
 * Returns `null` for a `401` (no session, or a revoked/unrefreshable token) —
 * this is a normal, expected state for a signed-out visitor, not an error, so
 * it does not throw and does not trigger TanStack Query's retry/error path.
 * Any other non-2xx status is treated as a genuine failure.
 *
 * @throws When the request fails for a reason other than "not signed in".
 */
const fetchSession = async (): Promise<AuthUser | null> => {
  const response = await fetch("/api/auth/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load the current session.");
  }

  const data = (await response.json()) as { user: AuthUser };
  return data.user;
};

/**
 * The current signed-in user, or `null` if signed out.
 *
 * `staleTime: Infinity` — a session doesn't go stale on its own; it only ever
 * changes as a result of an explicit action this app already knows about
 * (sign-in, sign-up, sign-out, profile update), each of which invalidates
 * `queryKeys.session()` itself rather than relying on a timed refetch.
 */
export const useSessionQuery = () =>
  useQuery({
    queryKey: queryKeys.session(),
    queryFn: fetchSession,
    staleTime: Infinity,
  });
