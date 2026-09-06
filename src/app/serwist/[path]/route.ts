/**
 * Route handler that builds and serves the Serwist service worker bundle
 * (compiled from `src/app/sw.ts`) and its related assets, such as
 * `/serwist/sw.js`, under this catch-all `[path]` segment.
 *
 * `createSerwistRoute` compiles the worker at request/build time and returns
 * the route segment config plus a `GET` handler, which are re-exported here
 * for Next.js to pick up.
 */
import { spawnSync } from "node:child_process";

import { createSerwistRoute } from "@serwist/turbopack";

// Ties the offline fallback's precache revision to the current commit, so a
// deploy that changes `src/app/offline/page.tsx` busts the cached copy.
// Falls back to a random id if `git` isn't available in the runtime
// (e.g. a serverless container without the repo history).
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim() ?? crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    // Precache the offline fallback page alongside the worker's own manifest.
    additionalPrecacheEntries: [{ url: "/offline", revision }],
    // Source file for the service worker logic (caching strategies, fallbacks).
    swSrc: "src/app/sw.ts",
    // Bundle the worker with esbuild directly instead of going through webpack/Turbopack.
    useNativeEsbuild: true,
  });
