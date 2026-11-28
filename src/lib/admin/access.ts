import type { AuthUser } from "@/types/auth";

/**
 * Whether an account may open the admin portal.
 *
 * Client-safe on purpose: the sidebar uses it to decide whether to show the
 * "Admin portal" row. It is never the gate itself. Every `/admin` page calls
 * `requireSuperadmin` on the server, every `/api/admin` route calls
 * `withSuperadmin`, and `firestore.rules` checks the role a third time.
 *
 * @param user - The signed-in account, or `null`/`undefined` when signed out.
 * @returns `true` only for `role: "superadmin"`. Gold, Special and every other
 *   plan are customers, not administrators.
 *
 * @example
 * isSuperadmin(useAuthStore.getState().user); // false for a Gold account
 */
export const isSuperadmin = (
  user: Pick<AuthUser, "role"> | null | undefined,
): boolean => user?.role === "superadmin";
