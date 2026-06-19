import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserDocument } from "@/types/template";

const EMPTY: UserDocument[] = [];

const makeDocumentId = () =>
  `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

type DocumentsState = {
  createDocument: (
    uid: string,
    input: { name: string; templateId: string; values: Record<string, string> },
  ) => string;
  documentsByUser: Record<string, UserDocument[]>;
  removeDocument: (uid: string, documentId: string) => void;
  updateDocument: (
    uid: string,
    documentId: string,
    patch: { name?: string; values?: Record<string, string> },
  ) => void;
};

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set) => ({
      documentsByUser: {},
      createDocument: (uid, input) => {
        const id = makeDocumentId();
        const now = Date.now();

        set((state) => {
          const document: UserDocument = {
            createdAt: now,
            id,
            name: input.name,
            templateId: input.templateId,
            updatedAt: now,
            values: input.values,
          };

          return {
            documentsByUser: {
              ...state.documentsByUser,
              [uid]: [...(state.documentsByUser[uid] ?? []), document],
            },
          };
        });

        return id;
      },
      updateDocument: (uid, documentId, patch) =>
        set((state) => ({
          documentsByUser: {
            ...state.documentsByUser,
            [uid]: (state.documentsByUser[uid] ?? []).map((document) =>
              document.id === documentId
                ? { ...document, ...patch, updatedAt: Date.now() }
                : document,
            ),
          },
        })),
      removeDocument: (uid, documentId) =>
        set((state) => ({
          documentsByUser: {
            ...state.documentsByUser,
            [uid]: (state.documentsByUser[uid] ?? []).filter(
              (document) => document.id !== documentId,
            ),
          },
        })),
    }),
    { name: "dokiments-documents" },
  ),
);

/** Stable list of a user's created documents. */
export const useUserDocuments = (uid: string | undefined) =>
  useDocumentsStore((state) => (uid && state.documentsByUser[uid]) || EMPTY);
