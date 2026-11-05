import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

/** What the public invite endpoint shows about the document. */
export interface InvitePreviewData {
  name: string;
  ownerEmail: string;
  ownerName: string;
}

/**
 * Result of looking up an invite link.
 *
 * - `valid`: the link works, and `invite` holds the preview.
 * - `expired`: the 14-day window has passed.
 * - `invalid`: unknown, replaced, revoked or malformed. These are not told apart.
 */
export type InviteLookupResult =
  | { state: "valid"; invite: InvitePreviewData }
  | { state: "expired" }
  | { state: "invalid" };

/** Thrown when accepting an invite with an account it was not sent to. */
export class InviteMismatchError extends Error {
  /** The invited address with the middle masked, such as `j***@example.com`. */
  readonly invitedEmail: string;

  constructor(invitedEmail: string) {
    super("This invitation was sent to a different email address.");
    this.name = "InviteMismatchError";
    this.invitedEmail = invitedEmail;
  }
}

const fetchInvite = async (token: string): Promise<InviteLookupResult> => {
  const response = await fetch(
    `/api/shared-invites/${encodeURIComponent(token)}`,
  );

  if (!response.ok) {
    throw new Error("Unable to load this invitation.");
  }

  return (await response.json()) as InviteLookupResult;
};

/** Looks up the public preview for an invite link. Needs no session. */
export const useInvitePreviewQuery = (token: string) =>
  useQuery({
    queryKey: queryKeys.sharedInvites.detail(token),
    queryFn: () => fetchInvite(token),
    // The link can be replaced or revoked at any time, so never reuse a result.
    staleTime: 0,
    retry: false,
  });

/**
 * Accepts an invite for the signed-in account and resolves with the shared
 * document ID. Rejects with {@link InviteMismatchError} for the wrong account,
 * and a plain `Error` for an expired or invalid link.
 */
export const useAcceptInviteMutation = (token: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<string> => {
      const response = await fetch(
        `/api/shared-invites/${encodeURIComponent(token)}/accept`,
        { method: "POST" },
      );
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        invitedEmail?: string;
        sharedDocumentId?: string;
      };

      if (response.status === 403 && data.invitedEmail) {
        throw new InviteMismatchError(data.invitedEmail);
      }

      if (!response.ok || !data.sharedDocumentId) {
        throw new Error(data.error ?? "Unable to accept this invitation.");
      }

      return data.sharedDocumentId;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.sharedDocuments.all(),
      }),
  });
};
