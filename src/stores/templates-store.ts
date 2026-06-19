import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SavedTemplate } from "@/types/template";

const EMPTY: SavedTemplate[] = [];

const makeSavedId = () =>
  `sv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

type TemplatesState = {
  removeTemplate: (uid: string, savedId: string) => void;
  saveTemplate: (uid: string, templateId: string) => void;
  savedByUser: Record<string, SavedTemplate[]>;
};

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set) => ({
      savedByUser: {},
      saveTemplate: (uid, templateId) =>
        set((state) => {
          const existing = state.savedByUser[uid] ?? [];

          // A template is owned once; adding again is a no-op.
          if (existing.some((item) => item.templateId === templateId)) {
            return state;
          }

          const saved: SavedTemplate = {
            savedAt: Date.now(),
            savedId: makeSavedId(),
            templateId,
          };

          return { savedByUser: { ...state.savedByUser, [uid]: [...existing, saved] } };
        }),
      removeTemplate: (uid, savedId) =>
        set((state) => ({
          savedByUser: {
            ...state.savedByUser,
            [uid]: (state.savedByUser[uid] ?? []).filter((item) => item.savedId !== savedId),
          },
        })),
    }),
    { name: "dokiments-templates" },
  ),
);

/** Stable list of a user's saved (owned) templates. */
export const useSavedTemplates = (uid: string | undefined) =>
  useTemplatesStore((state) => (uid && state.savedByUser[uid]) || EMPTY);
