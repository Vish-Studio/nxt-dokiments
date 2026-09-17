"use client";

import { useEffect, useState } from "react";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  OPEN_COOKIE_SETTINGS_EVENT,
  readCookieConsent,
} from "@/lib/cookie-consent";

/**
 * Reports whether the visitor has answered the cookie banner yet, so other
 * popups can queue behind it instead of competing with it for the same frame.
 *
 * Starts `false` and reads `localStorage` inside the effect rather than during
 * render: the server has no way to know the stored choice, so reading it any
 * earlier would produce a hydration mismatch.
 *
 * Goes back to `false` when the footer's "Cookie settings" button re-opens the
 * banner. A popup that has already been shown is unaffected — it owns its own
 * open state — but one still waiting on its timer re-defers rather than landing
 * on top of the re-opened banner.
 */
export const useCookieConsentSettled = () => {
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    const settle = () => setIsSettled(true);
    const unsettle = () => setIsSettled(false);

    if (readCookieConsent() !== null) {
      settle();
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, settle);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, unsettle);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, settle);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, unsettle);
    };
  }, []);

  return isSettled;
};
