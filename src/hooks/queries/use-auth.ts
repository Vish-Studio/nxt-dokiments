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

/**
 * Thrown when the server rejects a request with `code: "REAUTH_REQUIRED"` —
 * the session is valid but too old for this operation. Callers should catch
 * this specifically (via `instanceof`) to prompt for the current password
 * and retry, rather than showing it as a generic error.
 */
export class ReauthRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReauthRequiredError";
  }
}

const postUpdatePassword = async (password: string): Promise<void> => {
  const response = await fetch("/api/auth/update-password", {
    body: JSON.stringify({ password }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const data = (await response.json()) as Partial<AuthApiError> & {
      code?: string;
    };

    if (data.code === "REAUTH_REQUIRED") {
      throw new ReauthRequiredError(
        data.error ?? "Please re-enter your password to continue.",
      );
    }

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

const postForgotPassword = async (email: string): Promise<void> => {
  const response = await fetch("/api/auth/forgot-password", {
    body: JSON.stringify({ email }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const data = (await response.json()) as Partial<AuthApiError>;
    throw new Error(data.error ?? "Unable to send reset email.");
  }
};

/**
 * Requests a Firebase password-reset email for the given address.
 *
 * No cache to invalidate — this is a public, unauthenticated action with no
 * effect on any cached query.
 */
export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: postForgotPassword,
  });

const postReauthenticate = async (password: string): Promise<void> => {
  const response = await fetch("/api/auth/reauthenticate", {
    body: JSON.stringify({ password }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const data = (await response.json()) as Partial<AuthApiError>;
    throw new Error(data.error ?? "Unable to verify your password.");
  }
};

/**
 * Re-authenticates the signed-in user with their current password, to
 * recover from `ReauthRequiredError` on a sensitive action (e.g. changing
 * the password). Rotates the session's tokens server-side but doesn't change
 * anything the client reads from `queryKeys.session()` — same as
 * `useUpdatePasswordMutation`, there's no cache to invalidate.
 */
export const useReauthenticateMutation = () =>
  useMutation({
    mutationFn: postReauthenticate,
  });
