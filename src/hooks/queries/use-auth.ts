import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import type { AuthProfileDetails, AuthUser } from "@/types/auth";

export type UpdateProfileInput = AuthProfileDetails & {
  displayName: string;
};

const postUpdateProfile = async (input: UpdateProfileInput): Promise<AuthUser> => {
  const response = await fetch("/api/auth/update-profile", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = (await response.json()) as { user: AuthUser } & Partial<{ error: string }>;

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
