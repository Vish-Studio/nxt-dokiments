import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { UnauthorizedError } from "@/lib/query/unauthorized-error";
import type { ShareLedgerEntry, ShareRecipientStatus } from "@/types/sharing";

/**
 * Thrown when the server refuses a share because the plan's recipient limit is
 * reached (`403` — the only `403` the share route answers).
 *
 * A distinct type so the dialog can offer an upgrade instead of a plain error.
 */
export class ShareLimitReachedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShareLimitReachedError";
  }
}

/** What the share route returns on success. */
export type ShareDocumentResult = {
  recipient: { email: string; status: ShareRecipientStatus };
  sharedDocumentId: string;
};

type ShareDocumentVariables = { documentId: string; email: string };

const postShare = async ({
  documentId,
  email,
}: ShareDocumentVariables): Promise<ShareDocumentResult> => {
  const response = await fetch(
    `/api/documents/${encodeURIComponent(documentId)}/share`,
    {
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  const data = (await response.json()) as ShareDocumentResult & {
    error?: string;
  };

  if (!response.ok) {
    const message = data.error ?? "Unable to share this document right now.";

    if (response.status === 403) {
      throw new ShareLimitReachedError(message);
    }

    throw new Error(message);
  }

  return data;
};

/** Shares one of the signed-in user's documents with an email address. */
export const useShareDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postShare,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.shareRecipients.all(),
      }),
  });
};

const fetchShareRecipients = async (): Promise<ShareLedgerEntry[]> => {
  const response = await fetch("/api/documents/share-recipients");

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error("Unable to load your recent recipients.");
  }

  const data = (await response.json()) as { recipients: ShareLedgerEntry[] };
  return data.recipients;
};

/**
 * People the signed-in user has shared with before, most recent first. Only
 * fetched while `enabled`, so the dialog loads it once it opens.
 */
export const useShareRecipientsQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    enabled,
    queryKey: queryKeys.shareRecipients.all(),
    queryFn: fetchShareRecipients,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
