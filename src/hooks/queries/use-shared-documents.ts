import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { UnauthorizedError } from "@/lib/query/unauthorized-error";
import type { SharedDocument } from "@/types/sharing";

const fetchSharedDocuments = async (by?: "me"): Promise<SharedDocument[]> => {
  const response = await fetch(
    by ? `/api/documents/shared?by=${by}` : "/api/documents/shared",
  );

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error("Unable to load shared documents.");
  }

  const data = (await response.json()) as { documents: SharedDocument[] };
  return data.documents;
};

/** Documents other people have shared with the signed-in user, newest first. */
export const useSharedDocumentsQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    enabled,
    queryKey: queryKeys.sharedDocuments.all(),
    queryFn: () => fetchSharedDocuments(),
    // Changes when someone else shares, so refetching on focus is what surfaces new shares.
    refetchOnWindowFocus: true,
  });

/** Documents the signed-in user has shared with others, newest first. */
export const useSharedByMeQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    enabled,
    queryKey: queryKeys.sharedDocuments.byMe(),
    queryFn: () => fetchSharedDocuments("me"),
    // Changes when a recipient signs, so refetching on focus keeps the row action current.
    refetchOnWindowFocus: true,
  });

/** Thrown for a shared document the caller cannot see (`404`), so the page can say so. */
export class SharedDocumentNotFoundError extends Error {
  constructor() {
    super("This shared document doesn't exist or isn't shared with you.");
    this.name = "SharedDocumentNotFoundError";
  }
}

const fetchSharedDocument = async (id: string): Promise<SharedDocument> => {
  const response = await fetch(
    `/api/documents/shared/${encodeURIComponent(id)}`,
  );

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (response.status === 404) {
    throw new SharedDocumentNotFoundError();
  }

  if (!response.ok) {
    throw new Error("Unable to load this shared document.");
  }

  const data = (await response.json()) as { document: SharedDocument };
  return data.document;
};

/** One shared document, for its owner or recipient. */
export const useSharedDocumentQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.sharedDocuments.detail(id),
    queryFn: () => fetchSharedDocument(id),
    retry: (failureCount, error) =>
      !(error instanceof SharedDocumentNotFoundError) && failureCount < 2,
  });

const postSignature = async ({
  id,
  signature,
}: {
  id: string;
  signature: string;
}): Promise<SharedDocument> => {
  const response = await fetch(
    `/api/documents/shared/${encodeURIComponent(id)}/sign`,
    {
      body: JSON.stringify({ signature }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  const data = (await response.json()) as {
    document?: SharedDocument;
    error?: string;
  };

  if (!response.ok || !data.document) {
    throw new Error(data.error ?? "Unable to sign this document right now.");
  }

  return data.document;
};

/** Signs a shared document, which also locks it. Refreshes every shared-document list. */
export const useSignSharedDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postSignature,
    onSuccess: (document) => {
      queryClient.setQueryData(
        queryKeys.sharedDocuments.detail(document.id),
        document,
      );
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sharedDocuments.all(),
      });
    },
  });
};
