import { analyticsConfig } from "@/lib/analytics/config";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Arguments accepted by the `gtag` command queue. gtag is a variadic,
 * positionally-typed API (`gtag("event", name, params)`), so this stays a
 * loose tuple rather than an overload set — the type-safe surface callers
 * use is `trackEvent` in `track.ts`, not this.
 */
type GtagArgs = readonly [command: string, ...rest: unknown[]];

/**
 * Pushes a raw gtag command onto the dataLayer, creating it if absent so that
 * commands queued before `gtag.js` loads are replayed once it does.
 *
 * Fidelity note: the canonical Google shim is
 * `function gtag(){ dataLayer.push(arguments); }`, which pushes an
 * `arguments` object, not an `Array`. This pushes a real array instead to
 * stay within the repo's arrow-function conventions. gtag.js accepts both in
 * practice — verify in GA4 DebugView if consent or events ever appear to be
 * silently ignored.
 */
export const pushGtag = (...args: GtagArgs) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
};

/** Consent Mode v2 storage state Dokiments makes decisions about. */
export type ConsentState = "denied" | "granted";

/**
 * Upgrades or downgrades Consent Mode v2's `analytics_storage` grant after
 * the user picks an option in the cookie banner.
 *
 * Only `analytics_storage` moves: Dokiments loads no advertising tags, so the
 * ad-related grants set in the `beforeInteractive` consent-default script
 * stay denied permanently rather than being toggled here.
 */
export const updateConsent = (state: ConsentState) => {
  pushGtag("consent", "update", { analytics_storage: state });
};

/**
 * Associates subsequent events with a Firebase UID so GA4 can stitch
 * sessions across devices. Requires the GA4 property's reporting identity to
 * include User-ID, otherwise the value is accepted and ignored.
 */
export const setUserId = (userId: string) => {
  pushGtag("config", analyticsConfig.measurementId, { user_id: userId });
};

/** Clears the User-ID association on sign-out. */
export const clearUserId = () => {
  pushGtag("config", analyticsConfig.measurementId, { user_id: null });
};
