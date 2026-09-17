/**
 * Decisions behind the "a new version is available" prompt, kept as pure
 * functions so the two rules most likely to cause damage can be tested outside a
 * browser: when a reload is allowed, and how often the worker may be polled.
 *
 * `use-app-update.ts` owns the service worker event plumbing and calls into this.
 */

/**
 * Shortest gap between two `serwist.update()` calls.
 *
 * The browser checks for a new worker on navigation, which is enough for a normal
 * tab but not for an installed PWA: on iOS the app is usually resumed rather than
 * relaunched, so it can go days without navigating. Polling on every resume would
 * mean a request each time the user glances at the app, hence the floor.
 */
export const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

/**
 * `sessionStorage` key recording that this tab has already reloaded itself for an
 * update.
 *
 * `sessionStorage` rather than `localStorage` deliberately: the guard should last
 * as long as the tab, and a stuck flag must not outlive it and suppress a genuine
 * reload weeks later.
 */
export const RELOAD_GUARD_KEY = "dokiments-sw-reloaded";

type ReloadDecision = {
  /** Whether the user asked for the update, rather than it arriving on its own. */
  hasAccepted: boolean;
  /** Whether this tab has already reloaded once for an update. */
  hasReloaded: boolean;
};

/**
 * Whether a `controlling` event should turn into a page reload.
 *
 * `controlling` fires whenever a worker takes control, including the very first
 * install on a first visit, so reloading on the event alone would reload the page
 * under every new visitor. Acceptance is the signal that a reload was asked for.
 *
 * `hasReloaded` is a circuit breaker, not an optimisation: if a worker were ever
 * to activate repeatedly, reloading each time would trap the tab in a loop with no
 * way for the user to escape it.
 */
export const shouldReloadForUpdate = ({
  hasAccepted,
  hasReloaded,
}: ReloadDecision): boolean => hasAccepted && !hasReloaded;

type UpdateCheckDecision = {
  now: number;
  /** When the worker was last polled, or `null` if it never has been. */
  lastCheckedAt: number | null;
  intervalMs?: number;
};

/**
 * Whether enough time has passed to ask the browser for a new worker again.
 *
 * A first check (`lastCheckedAt === null`) always goes ahead; the throttle only
 * governs repeats.
 */
export const shouldCheckForUpdate = ({
  now,
  lastCheckedAt,
  intervalMs = UPDATE_CHECK_INTERVAL_MS,
}: UpdateCheckDecision): boolean =>
  lastCheckedAt === null || now - lastCheckedAt >= intervalMs;
