/**
 * Service worker entry point for PWA support, built with Serwist and injected
 * with a precache manifest by `@serwist/turbopack` at build time.
 *
 * This file runs in the service worker global scope, not the browser window,
 * so it has no access to the DOM and must use `self` instead of `window`.
 */
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Populated by the Serwist build plugin with the list of assets to precache.
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  // Assets to cache on install, generated at build time.
  precacheEntries: self.__SW_MANIFEST,
  // Activate this worker immediately instead of waiting for old tabs to close.
  skipWaiting: true,
  // Take control of any open tabs as soon as this worker activates.
  clientsClaim: true,
  // Let the browser start fetching navigation requests in parallel with worker startup.
  navigationPreload: true,
  // Default runtime caching strategies (fonts, images, API routes, etc.) from Serwist.
  runtimeCaching: defaultCache,
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
