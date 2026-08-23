"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { readSessionExpiryDeadline } from "@/lib/auth/session-expiry";
import { signOutAndRedirect } from "@/lib/auth/sign-out";
import { useAuthStore } from "@/stores/auth-store";

/** `setTimeout` stores its delay in a signed 32-bit int; anything larger fires immediately. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/** Where an automatically-expired session lands, so the page can explain itself. */
const EXPIRED_REDIRECT = "/sign-in?expired=1";

/**
 * Signs the user out the moment their session hits its 1-day deadline, without
 * waiting for them to click something.
 *
 * Reads the deadline from the readable `SESSION_EXPIRY_COOKIE` rather than
 * polling an endpoint, so the timer can be armed immediately on mount. The
 * server is still the authority — `proxy.ts`, `withSession` and
 * `GET /api/auth/me` all reject an expired session on their own — this hook only
 * makes the sign-out *visible* in a tab that is sitting idle.
 *
 * The `visibilitychange`/`focus` re-check is what makes it dependable: browsers
 * heavily throttle timers in background tabs, and a machine that sleeps through
 * the deadline will not fire a pending `setTimeout` on time.
 *
 * Mount once, high in the tree — `AuthProvider` already does this.
 */
export const useSessionTimeout = () => {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let timer: number | undefined;
    let isSigningOut = false;

    const expire = () => {
      // Guard against the timer and a focus event both firing.
      if (isSigningOut) {
        return;
      }

      isSigningOut = true;
      void signOutAndRedirect(queryClient, clearSession, EXPIRED_REDIRECT);
    };

    const schedule = () => {
      window.clearTimeout(timer);

      const deadline = readSessionExpiryDeadline();

      // No cookie: signed out already, or the dev auth bypass is on.
      if (deadline === null) {
        return;
      }

      const remaining = deadline - Date.now();

      if (remaining <= 0) {
        expire();
        return;
      }

      // Deadlines beyond the timer ceiling (the dev bypass uses a sentinel far in
      // the future) get re-checked rather than treated as "already expired".
      timer =
        remaining > MAX_TIMEOUT_MS
          ? window.setTimeout(schedule, MAX_TIMEOUT_MS)
          : window.setTimeout(expire, remaining);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        schedule();
      }
    };

    schedule();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", schedule);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", schedule);
    };
  }, [clearSession, queryClient]);
};
