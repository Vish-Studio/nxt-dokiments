import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { UnauthorizedError } from "@/lib/query/unauthorized-error";
import type { SharedDocument } from "@/types/sharing";

const fetchSharedDocuments = async (): Promise<SharedDocument[]> => {
  const response = await fetch("/api/documents/shared");

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error("Unable to load documents shared with you.");
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
    queryFn: fetchSharedDocuments,
    // Changes when someone else shares, so refetching on focus is what surfaces new shares.
    refetchOnWindowFocus: true,
  });
