import { useEffect } from "react";
import { create } from "zustand";

import { getSavedTemplateLimit } from "@/lib/market-place";
import { useAuthStore } from "@/stores/auth-store";
import type { SavedTemplate } from "@/types/template";

/** Stable empty array reference returned when a user has no saved templates yet. */
const EMPTY: SavedTemplate[] = [];

/**
 * Internal Zustand state for the templates store.
 * Keyed by user UID so multiple accounts can coexist in a single browser session
 * without one user's data leaking to another after a sign-out/sign-in cycle.
 */
type TemplatesState = {
  /** UIDs for which a Firestore fetch has already been attempted. */
  loadedUsers: Record<string, boolean>;
  /** Marks a UID as loaded regardless of whether the fetch succeeded. */
  markLoaded: (uid: string) => void;
  /** Saved templates indexed by user UID. */
  savedByUser: Record<string, SavedTemplate[]>;
  /** Replaces the saved-template list for a specific user. */
  setSaved: (uid: string, items: SavedTemplate[]) => void;
};

/** Internal store — prefer the selector hooks below over direct access. */
export const useTemplatesStore = create<TemplatesState>((set) => ({
  loadedUsers: {},
  savedByUser: {},
  markLoaded: (uid) => set((state) => ({ loadedUsers: { ...state.loadedUsers, [uid]: true } })),
  setSaved: (uid, items) =>
    set((state) => ({ savedByUser: { ...state.savedByUser, [uid]: items } })),
}));

/**
 * Returns the stable saved-template list for `uid`.
 * Returns an empty array (stable reference) when `uid` is undefined or not yet loaded.
 */
export const useSavedTemplates = (uid: string | undefined) =>
  useTemplatesStore((state) => (uid && state.savedByUser[uid]) || EMPTY);

/**
 * Hydrates the signed-in user's saved templates from Firestore exactly once per
 * session. Must be mounted inside a component that has access to the auth store.
 *
 * The fetch is skipped when:
 * - No user is authenticated.
 * - Templates for this UID have already been loaded (success or failure).
 *
 * On failure, `markLoaded` is still called so the app does not retry in a loop.
 */
export const useSyncSavedTemplates = () => {
  const user = useAuthStore((state) => state.user);
  const setSaved = useTemplatesStore((state) => state.setSaved);
  const markLoaded = useTemplatesStore((state) => state.markLoaded);
  const loaded = useTemplatesStore((state) => (user ? Boolean(state.loadedUsers[user.uid]) : false));

  useEffect(() => {
    if (!user || loaded) {
      return;
    }

    let active = true;

    fetch("/api/templates")
      .then((res) => res.json())
      .then((items: SavedTemplate[]) => {
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
  }, [user, loaded, setSaved, markLoaded]);
};

/** Possible outcomes of an `addTemplate` call. */
export type AddTemplateResult = { ok: true } | { ok: false; reason: "auth" | "error" | "limit" };

/**
 * Provides template save/remove actions with Firestore persistence and the
 * plan-tier cap enforced client-side.
 *
 * Optimistic update pattern: the in-memory list is updated immediately and
 * rolled back if the Firestore write fails, so the UI stays responsive.
 */
export const useTemplateLibrary = () => {
  const user = useAuthStore((state) => state.user);
  const saved = useSavedTemplates(user?.uid);
  const setSaved = useTemplatesStore((state) => state.setSaved);

  const limit = getSavedTemplateLimit(user?.role);
  const isAtLimit = saved.length >= limit;

  /**
   * Saves a template to the user's library.
   *
   * @param templateId - ID of the marketplace template to save.
   * @returns `{ ok: true }` when saved (or already present).
   * @returns `{ ok: false, reason: "auth" }` when the user is not signed in.
   * @returns `{ ok: false, reason: "limit" }` when the plan cap is reached.
   * @returns `{ ok: false, reason: "error" }` when the Firestore write fails.
   */
  const addTemplate = async (templateId: string): Promise<AddTemplateResult> => {
    if (!user) {
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
      await fetch("/api/templates", {
        body: JSON.stringify({ items: next }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      return { ok: true };
    } catch {
      setSaved(user.uid, saved);
      return { ok: false, reason: "error" };
    }
  };

  return { addTemplate, isAtLimit, limit, saved };
};
