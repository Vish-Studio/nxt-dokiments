/**
 * Service worker entry point for PWA support, built with Serwist and injected
 * with a precache manifest by `@serwist/turbopack` at build time.
 *
 * This file runs in the service worker global scope, not the browser window,
 * so it has no access to the DOM and must use `self` instead of `window`.
 */
import { defaultCache } from "@serwist/turbopack/worker";
import type {
  PrecacheEntry,
  RuntimeCaching,
  SerwistGlobalConfig,
} from "serwist";
import { NetworkOnly, Serwist } from "serwist";

import { parsePushPayload, safeNotificationPath } from "@/lib/push/payload";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Populated by the Serwist build plugin with the list of assets to precache.
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Cache written by the `NetworkFirst` API rule inside `defaultCache`, which
 * `apiNetworkOnly` below now shadows. Named here only so already-installed
 * devices can be cleaned up — see the `activate` listener. Serwist returns a
 * caller-supplied `cacheName` verbatim, so this is the literal bucket name in
 * Cache Storage, with no `serwist-` prefix.
 */
const STALE_API_CACHE_NAME = "apis";

/**
 * Never cache same-origin API responses.
 *
 * Every `GET /api/*` route is session-gated with `withSession`, but Cache Storage
 * is keyed by URL and shared by every session on the device, so a cached response
 * outlives the session that fetched it. On a slow or absent network the previous
 * user's clients or documents would be replayed to whoever is signed in now —
 * after a sign-out, or for a second person on the same phone — without the
 * request ever reaching the server to be rejected.
 *
 * This has to sit ahead of `defaultCache`, whose own `/api/` rule is
 * `NetworkFirst`: the first matching route wins. Deliberately no
 * `networkTimeoutSeconds`, so a slow request behaves exactly as it does in a
 * normal browser tab and React Query keeps ownership of retries and error state.
 *
 * The `fallbacks` entry below does not apply here: its matcher requires
 * `request.destination === "document"`, so a failed API call surfaces as a
 * rejection rather than the `/offline` page's HTML.
 */
const apiNetworkOnly: RuntimeCaching = {
  matcher: ({ sameOrigin, url: { pathname } }) =>
    sameOrigin && pathname.startsWith("/api/"),
  method: "GET",
  handler: new NetworkOnly(),
};

/**
 * One-time removal of the `apis` cache left behind by builds that predate
 * `apiNetworkOnly`. Serwist does not drop a runtime cache just because no
 * strategy writes to it any more, so those devices are still holding
 * authenticated responses; changing the strategy alone does not reach them.
 *
 * Registered before `serwist.addEventListeners()` — service worker listeners are
 * additive and each `waitUntil` extends the same activation. `caches.delete`
 * resolves `false` when the cache is absent, so this is safe on every activation.
 *
 * Safe to remove after 2026-12-11, by which point a dormant install has had
 * three months to activate at least once.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.delete(STALE_API_CACHE_NAME));
});

/**
 * Shows a push as a system notification, even when every tab is closed.
 *
 * Always shows something: `parsePushPayload` falls back to a generic message,
 * because a worker that receives a push and displays nothing risks having its
 * permission revoked by the browser. `waitUntil` keeps the worker alive until the
 * notification is displayed.
 */
self.addEventListener("push", (event) => {
  const { body, tag, title, url } = parsePushPayload(event.data?.text());

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { url },
      icon: "/icons/icon-192.png",
      tag,
    }),
  );
});

/**
 * Opens the notification's target. Focuses and navigates an existing window of
 * the app when there is one, so the user is not left with duplicate tabs;
 * otherwise opens a new one (the installed PWA window when installed).
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(
    safeNotificationPath(event.notification.data?.url),
    self.location.origin,
  ).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        includeUncontrolled: true,
        type: "window",
      });
      const existing = windows.find((client) =>
        client.url.startsWith(self.location.origin),
      );

      if (existing) {
        await existing.focus();
        await existing.navigate(target).catch(() => undefined);
        return;
      }

      await self.clients.openWindow(target);
    })(),
  );
});

const serwist = new Serwist({
  // Assets to cache on install, generated at build time.
  precacheEntries: self.__SW_MANIFEST,
  // Park in `waiting` until the user accepts the update via `AppUpdateBanner`,
  // which posts `SKIP_WAITING` back here. Activating immediately would put this
  // worker in charge of a page still running the previous build's JavaScript, whose
  // chunks this worker's install has already pruned from the precache — so a
  // lazily-imported route would 404. Serwist registers the `SKIP_WAITING` listener
  // itself whenever this is false.
  skipWaiting: false,
  // Take control of any open tabs as soon as this worker activates.
  clientsClaim: true,
  // Let the browser start fetching navigation requests in parallel with worker startup.
  navigationPreload: true,
  // Default runtime caching strategies (fonts, images, pages, etc.) from Serwist,
  // with authenticated API responses excluded ahead of them.
  runtimeCaching: [apiNetworkOnly, ...defaultCache],
  fallbacks: {
    entries: [
      {
        // Serve the offline page when a document (page) navigation fails, e.g. no network.
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
