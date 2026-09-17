"use client";

import { create } from "zustand";

import type { BeforeInstallPromptEvent, InstallOutcome } from "@/types/pwa";

type InstallPromptState = {
  /**
   * Spends the held event on Chromium's install dialog and reports what the user
   * chose, or `null` when there is nothing to prompt with.
   */
  promptInstall: () => Promise<InstallOutcome | null>;
  /** The held `beforeinstallprompt` event, or `null` if none is available. */
  capturedPrompt: BeforeInstallPromptEvent | null;
  /** Whether a captured event has already been spent. Never resets. */
  hasUsedPrompt: boolean;
  /** Set by the `appinstalled` event, which fires whether or not we prompted. */
  isInstalled: boolean;
  /** Records an install observed by the browser rather than by us. */
  markInstalled: () => void;
};

/**
 * Holds the pending install prompt for the whole tab.
 *
 * A store rather than component state because of *when* the event arrives.
 * Chromium fires `beforeinstallprompt` once it has evaluated the manifest and
 * service worker, and it fires exactly once per page load — if nothing is
 * listening at that moment the offer is simply gone, and no amount of later
 * mounting brings it back. The listener below is therefore registered at module
 * evaluation, during hydration, rather than in a component effect. Being a single
 * shared source also means the two mount points (the dashboard sidebar and the
 * marketing footer) cannot disagree about whether an install is on offer.
 */
export const useInstallPromptStore = create<InstallPromptState>((set, get) => ({
  capturedPrompt: null,
  hasUsedPrompt: false,
  isInstalled: false,
  markInstalled: () => set({ capturedPrompt: null, isInstalled: true }),
  promptInstall: async () => {
    const { capturedPrompt } = get();

    if (!capturedPrompt) {
      return null;
    }

    // Dropped before it is used, not after. The event is single-use — a second
    // `prompt()` rejects with `InvalidStateError` — and clearing first means a
    // double click cannot get two calls in while the first is still awaiting.
    set({ capturedPrompt: null, hasUsedPrompt: true });

    await capturedPrompt.prompt();
    const { outcome } = await capturedPrompt.userChoice;

    return outcome;
  },
}));

/**
 * Starts listening for the install prompt. Idempotent, and a no-op on the server.
 *
 * Runs as a module side effect, which is what makes it early enough to catch the
 * event — see the note on the store above. Nothing tears these listeners down:
 * they live as long as the tab, exactly like the events they are waiting for.
 */
const startCapturingInstallPrompt = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    // Suppresses Chromium's own mini-infobar so the offer surfaces through our
    // button instead, at a moment the user chose.
    event.preventDefault();
    useInstallPromptStore.setState({ capturedPrompt: event });
  });

  window.addEventListener("appinstalled", () => {
    // Also fires for an install started from the browser's own menu, which is the
    // only way to hear about that route.
    useInstallPromptStore.getState().markInstalled();
  });
};

startCapturingInstallPrompt();
