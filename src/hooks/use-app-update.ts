"use client";

import { useSerwist } from "@serwist/turbopack/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  RELOAD_GUARD_KEY,
  shouldCheckForUpdate,
  shouldReloadForUpdate,
} from "@/lib/pwa/update-policy";

/**
 * Surfaces a waiting service worker so the user can choose to move onto the new
 * build, and reloads the page once they do.
 *
 * The worker sets `skipWaiting: false`, so a new build installs and then parks in
 * `waiting` instead of activating underneath the open page. That is what makes this
 * hook necessary and also what makes it safe: until the user accepts, the previous
 * worker keeps serving the page *and the chunks it was built against*, so a
 * lazily-imported route cannot 404 against a precache that has already moved on.
 *
 * Reloading is never automatic (see `shouldReloadForUpdate`). A reload during
 * document editing would take the unsaved form with it, and being one version
 * behind does not outrank the user's work.
 *
 * Mount once, inside `SerwistProvider` — the root layout does this via
 * `AppUpdateBanner`.
 */
export const useAppUpdate = () => {
  const { serwist } = useSerwist();
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const hasAcceptedRef = useRef(false);
  const lastCheckedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!serwist) {
      return;
    }

    // Fires for a worker that installs now, and for one that was already waiting
    // from an earlier visit — that user is just as out of date and still needs the
    // prompt.
    const handleWaiting = () => setIsUpdateReady(true);

    const handleControlling = () => {
      const hasReloaded =
        window.sessionStorage.getItem(RELOAD_GUARD_KEY) !== null;

      if (
        !shouldReloadForUpdate({
          hasAccepted: hasAcceptedRef.current,
          hasReloaded,
        })
      ) {
        return;
      }

      window.sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
      window.location.reload();
    };

    serwist.addEventListener("waiting", handleWaiting);
    serwist.addEventListener("controlling", handleControlling);

    return () => {
      serwist.removeEventListener("waiting", handleWaiting);
      serwist.removeEventListener("controlling", handleControlling);
    };
  }, [serwist]);

  useEffect(() => {
    if (!serwist) {
      return;
    }

    // The browser only looks for a new worker on navigation. An installed PWA that
    // is resumed rather than relaunched may not navigate for days, so ask on the
    // way back to the foreground — throttled, since a resume is a frequent event.
    const checkForUpdate = () => {
      const now = Date.now();

      if (
        !shouldCheckForUpdate({ now, lastCheckedAt: lastCheckedAtRef.current })
      ) {
        return;
      }

      lastCheckedAtRef.current = now;
      void serwist.update();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", checkForUpdate);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", checkForUpdate);
    };
  }, [serwist]);

  /**
   * Tells the waiting worker to take over. The reload follows from the
   * `controlling` event rather than from here, so the new page is served by the new
   * worker instead of racing it.
   */
  const acceptUpdate = useCallback(() => {
    hasAcceptedRef.current = true;
    serwist?.messageSkipWaiting();
  }, [serwist]);

  /** Hides the prompt for this page view, leaving the waiting worker alone. */
  const dismissUpdate = useCallback(() => setIsDismissed(true), []);

  return {
    isUpdateReady: isUpdateReady && !isDismissed,
    acceptUpdate,
    dismissUpdate,
  };
};
