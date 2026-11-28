import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { UnauthorizedError } from "@/lib/query/unauthorized-error";
import type {
  AdminSystemStatus,
  AdminUserAccount,
  AdminUserDetail,
  NewsletterSubscriber,
} from "@/types/admin";
import type { FeedbackEntry } from "@/types/feedback";

/**
 * Admin data changes slowly and every read costs a full-collection scan, so
 * results stay fresh for a minute and are not refetched on window focus. The
 * banner's refresh button still refetches on demand.
 */
const ADMIN_STALE_MS = 60_000;

/**
 * GETs an `/api/admin` route and returns one field of its JSON body.
 *
 * @throws `UnauthorizedError` on 401 so the shared auth handling signs the user out.
 * @throws An `Error` with `fallback` as its message on any other failure; the
 *   route's own text is not shown, because a 404 here means "not an admin".
 */
const fetchAdmin = async <T>(path: string, field: string, fallback: string): Promise<T> => {
  const response = await fetch(path);

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error(fallback);
  }

  const data = (await response.json()) as Record<string, T>;
  return data[field];
};

/** Every account, newest first. Shared by Overview, Users, Plans and System. */
export const useAdminUsersQuery = () =>
  useQuery({
    queryFn: () =>
      fetchAdmin<AdminUserAccount[]>("/api/admin/users", "accounts", "Unable to load accounts."),
    queryKey: queryKeys.admin.users(),
    refetchOnWindowFocus: false,
    staleTime: ADMIN_STALE_MS,
  });

/**
 * One account's profile and feedback.
 *
 * @param uid - The account to load.
 */
export const useAdminUserQuery = (uid: string) =>
  useQuery({
    queryFn: () =>
      fetchAdmin<AdminUserDetail>(
        `/api/admin/users/${encodeURIComponent(uid)}`,
        "user",
        "Unable to load this account.",
      ),
    queryKey: queryKeys.admin.user(uid),
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: ADMIN_STALE_MS,
  });

/** Every feedback submission, most recent first. */
export const useAdminFeedbackQuery = () =>
  useQuery({
    queryFn: () =>
      fetchAdmin<FeedbackEntry[]>("/api/admin/feedback", "feedback", "Unable to load feedback."),
    queryKey: queryKeys.admin.feedback(),
    refetchOnWindowFocus: false,
    staleTime: ADMIN_STALE_MS,
  });

/** Every newsletter subscriber, newest first. */
export const useAdminNewsletterQuery = () =>
  useQuery({
    queryFn: () =>
      fetchAdmin<NewsletterSubscriber[]>(
        "/api/admin/newsletter",
        "subscribers",
        "Unable to load subscribers.",
      ),
    queryKey: queryKeys.admin.newsletter(),
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: ADMIN_STALE_MS,
  });

/** Flags, configuration checks, version and administrators. */
export const useAdminSystemQuery = () =>
  useQuery({
    queryFn: () =>
      fetchAdmin<AdminSystemStatus>("/api/admin/system", "system", "Unable to load system status."),
    queryKey: queryKeys.admin.system(),
    refetchOnWindowFocus: false,
    staleTime: ADMIN_STALE_MS,
  });
