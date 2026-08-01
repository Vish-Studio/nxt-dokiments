import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import type { AuthProfileDetails, AuthUser } from "@/types/auth";

/** Error shape returned by the auth API on a non-2xx response. */
type AuthApiError = { error: string };

export type UpdateProfileInput = AuthProfileDetails & {
  displayName: string;
};

const postUpdateProfile = async (
  input: UpdateProfileInput,
): Promise<AuthUser> => {
  const response = await fetch("/api/auth/update-profile", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = (await response.json()) as {
    user: AuthUser;
  } & Partial<AuthApiError>;

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to update profile.");
  }

  return data.user;
};

/**
 * Updates the signed-in user's profile fields.
 *
 * Writes the response straight into `queryKeys.session()` on success — the
 * session query has `staleTime: Infinity`, so without this, any component
 * reading `useSessionQuery()` directly would keep showing the pre-update
 * profile until a full page reload.
 */
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUpdateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.session(), user);
    },
  });
};

const postUpdatePassword = async (password: string): Promise<void> => {
  const response = await fetch("/api/auth/update-password", {
    body: JSON.stringify({ password }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const data = (await response.json()) as Partial<AuthApiError>;
    throw new Error(data.error ?? "Unable to change password.");
  }
};

/**
 * Changes the signed-in user's password.
 *
 * The API rotates the session's `idToken`/`refreshToken` server-side on a
 * successful change, but doesn't return a fresh `AuthUser` to write directly
 * into the cache (there's nothing to change on the user object itself) — so
 * this invalidates `queryKeys.session()` instead of `setQueryData`, forcing
 * the next read to go through `GET /api/auth/me` rather than serving the
 * `staleTime: Infinity` cached value.
 */
export const useUpdatePasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUpdatePassword,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.session() });
    },
  });
};
