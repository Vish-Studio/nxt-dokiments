import { useEffect } from "react";
import { create } from "zustand";

import { fetchSavedTemplates, persistSavedTemplates } from "@/lib/firebase/templates";
import { getSavedTemplateLimit } from "@/lib/market-place";
import { useAuthStore } from "@/stores/auth-store";
import type { SavedTemplate } from "@/types/template";

const EMPTY: SavedTemplate[] = [];

type TemplatesState = {
  loadedUsers: Record<string, boolean>;
  markLoaded: (uid: string) => void;
  savedByUser: Record<string, SavedTemplate[]>;
  setSaved: (uid: string, items: SavedTemplate[]) => void;
};

export const useTemplatesStore = create<TemplatesState>((set) => ({
  loadedUsers: {},
  savedByUser: {},
  markLoaded: (uid) => set((state) => ({ loadedUsers: { ...state.loadedUsers, [uid]: true } })),
  setSaved: (uid, items) =>
    set((state) => ({ savedByUser: { ...state.savedByUser, [uid]: items } })),
}));

/** Stable list of a user's saved (owned) templates. */
export const useSavedTemplates = (uid: string | undefined) =>
  useTemplatesStore((state) => (uid && state.savedByUser[uid]) || EMPTY);

/** Hydrate saved templates from Firestore once per signed-in user. */
export const useSyncSavedTemplates = () => {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const setSaved = useTemplatesStore((state) => state.setSaved);
  const markLoaded = useTemplatesStore((state) => state.markLoaded);
  const loaded = useTemplatesStore((state) => (user ? Boolean(state.loadedUsers[user.uid]) : false));

  useEffect(() => {
    if (!user || !session || loaded) {
      return;
    }

    let active = true;

    void fetchSavedTemplates(session)
      .then((items) => {
        if (active) {
          setSaved(user.uid, items);
          markLoaded(user.uid);
        }
      })
      .catch(() => {
        if (active) {
          markLoaded(user.uid);
        }
      });

    return () => {
      active = false;
    };
  }, [user, session, loaded, setSaved, markLoaded]);
};

export type AddTemplateResult = { ok: true } | { ok: false; reason: "auth" | "error" | "limit" };

/** Save/remove actions with Firestore persistence and the free-tier cap. */
export const useTemplateLibrary = () => {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const saved = useSavedTemplates(user?.uid);
  const setSaved = useTemplatesStore((state) => state.setSaved);

  const limit = getSavedTemplateLimit(user?.role);
  const isAtLimit = saved.length >= limit;

  const addTemplate = async (templateId: string): Promise<AddTemplateResult> => {
    if (!user || !session) {
      return { ok: false, reason: "auth" };
    }
    if (saved.some((item) => item.templateId === templateId)) {
      return { ok: true };
    }
    if (saved.length >= limit) {
      return { ok: false, reason: "limit" };
    }

    const next: SavedTemplate[] = [
      ...saved,
      { savedAt: Date.now(), savedId: templateId, templateId },
    ];
    setSaved(user.uid, next);

    try {
      await persistSavedTemplates(session, next);
      return { ok: true };
    } catch {
      setSaved(user.uid, saved);
      return { ok: false, reason: "error" };
    }
  };

  return { addTemplate, isAtLimit, limit, saved };
};
