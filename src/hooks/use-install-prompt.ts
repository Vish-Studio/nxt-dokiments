"use client";

import { useSyncExternalStore } from "react";

import type {
  InstallAffordance,
  InstallGuideKey,
} from "@/lib/pwa/install-availability";
import {
  detectInstallGuide,
  isRunningAsInstalledApp,
  resolveInstallAffordance,
} from "@/lib/pwa/install-availability";
import { useInstallPromptStore } from "@/stores/install-prompt-store";
import type { InstallOutcome } from "@/types/pwa";

const STANDALONE_MEDIA_QUERY = "(display-mode: standalone)";

/**
 * Subscription for a browser fact that cannot change while the page is open.
 * `useSyncExternalStore` still wants one, so this is the honest empty answer.
 */
const subscribeToNothing = () => () => {};

/**
 * Desktop Chromium can move an already-open tab into an installed app window,
 * which changes the display mode under a running page.
 */
const subscribeToDisplayMode = (onStoreChange: () => void) => {
  const standalone = window.matchMedia(STANDALONE_MEDIA_QUERY);

  standalone.addEventListener("change", onStoreChange);

  return () => standalone.removeEventListener("change", onStoreChange);
};

const getIsRunningInstalled = () =>
  isRunningAsInstalledApp({
    isStandaloneDisplayMode: window.matchMedia(STANDALONE_MEDIA_QUERY).matches,
    isIosStandalone: window.navigator.standalone === true,
  });

const getSupportsInstallPrompt = () => "onbeforeinstallprompt" in window;

const getInstallGuide = (): InstallGuideKey =>
  detectInstallGuide({
    userAgent: window.navigator.userAgent,
    maxTouchPoints: window.navigator.maxTouchPoints,
  });

type UseInstallPromptResult = {
  affordance: InstallAffordance;
  /** Which manual instructions to show when `affordance` is `"guide"`. */
  guide: InstallGuideKey;
  /** Opens Chromium's install dialog. Resolves `null` if no event is held. */
  promptInstall: () => Promise<InstallOutcome | null>;
};

/**
 * Tells a button whether Dokiments can be installed here, and how.
 *
 * The event plumbing lives in `install-prompt-store.ts` — this hook only reads the
 * per-browser facts, then defers every decision to `install-availability.ts`.
 *
 * Those facts are read through `useSyncExternalStore` rather than in an effect,
 * for its third argument: the server snapshots below are all chosen to resolve to
 * `"hidden"`, so the markup React renders on the server and hydrates against
 * contains no button at all. Reading `window` during render would mismatch, and
 * reading it in an effect would flash a button that then vanished. Each returns a
 * primitive, so repeated `getSnapshot` calls compare equal and cannot loop.
 *
 * Safe to mount more than once — the store is shared and the rest is read-only.
 */
export const useInstallPrompt = (): UseInstallPromptResult => {
  const capturedPrompt = useInstallPromptStore((state) => state.capturedPrompt);
  const hasUsedPrompt = useInstallPromptStore((state) => state.hasUsedPrompt);
  const isInstalledByEvent = useInstallPromptStore(
    (state) => state.isInstalled,
  );
  const promptInstall = useInstallPromptStore((state) => state.promptInstall);

  const isRunningInstalled = useSyncExternalStore(
    subscribeToDisplayMode,
    getIsRunningInstalled,
    () => false,
  );

  // `true` on the server so that, paired with no captured event, the affordance
  // starts out hidden.
  const supportsInstallPrompt = useSyncExternalStore(
    subscribeToNothing,
    getSupportsInstallPrompt,
    () => true,
  );

  const guide = useSyncExternalStore(
    subscribeToNothing,
    getInstallGuide,
    (): InstallGuideKey => "browser-menu",
  );

  return {
    affordance: resolveInstallAffordance({
      isInstalled: isRunningInstalled || isInstalledByEvent,
      supportsInstallPrompt,
      hasCapturedPrompt: capturedPrompt !== null,
      hasUsedPrompt,
    }),
    guide,
    promptInstall,
  };
};
