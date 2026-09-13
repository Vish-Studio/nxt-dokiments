/**
 * Types for the install-to-device flow, which the DOM lib does not describe.
 *
 * `beforeinstallprompt` is a Chromium-only, non-standard event (it sits in the
 * WICG Manifest Incubations spec, not the Web App Manifest standard), so
 * TypeScript ships no definition for it and no entry for it in `WindowEventMap`.
 * The augmentation below is what lets `window.addEventListener` type the handler
 * argument instead of widening it to `Event`.
 */

export type InstallOutcome = "accepted" | "dismissed";

/**
 * The event Chromium fires when a site meets its install criteria.
 *
 * Calling `preventDefault()` suppresses the browser's own mini-infobar and hands
 * the timing to the page. The event is single-use: a second `prompt()` on the same
 * instance rejects with `InvalidStateError`, which is why
 * `install-prompt-store.ts` discards it after use rather than holding onto it.
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: InstallOutcome;
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  interface Navigator {
    /**
     * Legacy WebKit flag, `true` only when an iOS home-screen app is running.
     * iOS supports `display-mode: standalone` too, but this has shipped since
     * iOS 2.1 and costs nothing to check alongside it.
     */
    readonly standalone?: boolean;
  }
}
