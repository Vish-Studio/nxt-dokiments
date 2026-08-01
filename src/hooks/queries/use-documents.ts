import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import type { UserDocument } from "@/types/template";

const fetchDocuments = async (templateId?: string): Promise<UserDocument[]> => {
  const query = templateId
    ? `?templateId=${encodeURIComponent(templateId)}`
    : "";
  const response = await fetch(`/api/documents${query}`);

  if (!response.ok) {
    throw new Error("Unable to load your documents.");
  }

  const data = (await response.json()) as { documents: UserDocument[] };
  return data.documents;
};

/** The signed-in user's documents, optionally filtered to those created from one template. */
export const useDocumentsQuery = (templateId?: string) =>
  useQuery({
    queryKey: queryKeys.documents.list(templateId),
    queryFn: () => fetchDocuments(templateId),
  });

const fetchDocument = async (documentId: string): Promise<UserDocument> => {
  const response = await fetch(`/api/documents/${documentId}`);

  if (!response.ok) {
    throw new Error("Unable to load this document.");
  }

  const data = (await response.json()) as { document: UserDocument };
  return data.document;
};

/** A single document by ID — used when a screen needs one document without the full list in memory. */
export const useDocumentQuery = (documentId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.documents.detail(documentId ?? ""),
    queryFn: () => fetchDocument(documentId ?? ""),
    enabled: Boolean(documentId),
  });

/** Error shape returned by the documents API on a non-2xx response. */
type DocumentsApiError = { error: string };

export type CreateDocumentInput = {
  name: string;
  templateId: string;
  values: Record<string, string>;
};

const postDocument = async (
  input: CreateDocumentInput,
): Promise<UserDocument> => {
  const response = await fetch("/api/documents", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = (await response.json()) as {
    document: UserDocument;
  } & Partial<DocumentsApiError>;

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to create this document.");
  }

  return data.document;
};

/**
 * Creates a new document from a template.
 *
 * No optimistic insert here — unlike saving a template (a single click with an
 * obvious outcome), document creation goes through a multi-field editor and the
 * server assigns the ID/`templateSnapshot`, so there's nothing meaningful to show
 * ahead of the response. Invalidates the documents list on success so the new
 * document appears everywhere it's listed.
 */
export const useCreateDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documents.all(),
      });
    },
  });
};

export type UpdateDocumentInput = {
  name?: string;
  values?: Record<string, string>;
};

const patchDocument = async (
  documentId: string,
  patch: UpdateDocumentInput,
): Promise<UserDocument> => {
  const response = await fetch(`/api/documents/${documentId}`, {
    body: JSON.stringify(patch),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });

  const data = (await response.json()) as {
    document: UserDocument;
  } & Partial<DocumentsApiError>;

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to save changes to this document.");
  }

  return data.document;
};

/**
 * Updates a document's `name` and/or `values`.
 *
 * Optimistically applies the patch to both the detail cache and any matching
 * entry in the list cache, rolling back both on failure.
 */
export const useUpdateDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      patch,
    }: {
      documentId: string;
      patch: UpdateDocumentInput;
    }) => patchDocument(documentId, patch),
    onMutate: async ({ documentId, patch }) => {
      const detailKey = queryKeys.documents.detail(documentId);
      const previousDetail = queryClient.getQueryData<UserDocument>(detailKey);
      if (previousDetail) {
        queryClient.setQueryData<UserDocument>(detailKey, {
          ...previousDetail,
          ...patch,
        });
      }

      const previousLists = queryClient.getQueriesData<UserDocument[]>({
        queryKey: queryKeys.documents.all(),
      });
      previousLists.forEach(([key, documents]) => {
        if (!documents) return;
        queryClient.setQueryData<UserDocument[]>(
          key,
          documents.map((document) =>
            document.id === documentId ? { ...document, ...patch } : document,
          ),
        );
      });

      return { previousDetail, previousLists };
    },
    onError: (_error, { documentId }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.documents.detail(documentId),
          context.previousDetail,
        );
      }
      context?.previousLists.forEach(([key, documents]) => {
        queryClient.setQueryData(key, documents);
      });
    },
    onSettled: (_data, _error, { documentId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documents.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documents.detail(documentId),
      });
    },
  });
};

const deleteDocumentRequest = async (documentId: string): Promise<void> => {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to delete this document.");
  }
};

/**
 * Deletes a document.
 *
 * Optimistically removes it from every matching list cache entry, rolling back on failure.
 */
export const useDeleteDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteDocumentRequest(documentId),
    onMutate: async (documentId) => {
      const previousLists = queryClient.getQueriesData<UserDocument[]>({
        queryKey: queryKeys.documents.all(),
      });
      previousLists.forEach(([key, documents]) => {
        if (!documents) return;
        queryClient.setQueryData<UserDocument[]>(
          key,
          documents.filter((document) => document.id !== documentId),
        );
      });

      return { previousLists };
    },
    onError: (_error, _documentId, context) => {
      context?.previousLists.forEach(([key, documents]) => {
        queryClient.setQueryData(key, documents);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documents.all(),
      });
    },
  });
};
