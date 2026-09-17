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

/**
 * Narrows a possibly-absent, possibly-blank string to a usable value.
 *
 * Every candidate below goes through this rather than through `??`, because the
 * failure this guards against is an *empty* string, not a missing one, and `""`
 * is not nullish. An unset CI variable and one exported as empty have to be
 * treated alike.
 */
const usable = (value: string | undefined): string | undefined =>
  value && value.trim() ? value.trim() : undefined;

/**
 * Reads the commit from `git`, for local development where neither CI variable
 * below is set.
 *
 * Only trusts the output of a command that actually succeeded: when `git` exists
 * but exits non-zero — a build container holding the source without `.git`, say —
 * it writes its diagnostic to stderr and leaves `stdout` as `""`.
 */
const gitRevision = (): string | undefined => {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" });
  return result.status === 0 ? usable(result.stdout) : undefined;
};

// Ties the offline fallback's precache revision to the current build, so a deploy
// that changes `src/app/offline/page.tsx` busts the cached copy. The commit SHA is
// preferred over the random id only because it is stable across redeploys of an
// identical commit, which spares users a pointless re-fetch.
//
// This value must never be empty. Serwist treats a falsy revision as "the URL is
// its own version", dropping the `__WB_REVISION__` cache-key parameter, so the
// precache install finds a match and skips the fetch — pinning `/offline` to the
// first copy ever cached, permanently, on every installed device.
const revision =
  usable(process.env.VERCEL_GIT_COMMIT_SHA) ??
  usable(process.env.GITHUB_SHA) ??
  gitRevision() ??
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    // Precache the offline fallback page alongside the worker's own manifest.
    additionalPrecacheEntries: [{ url: "/offline", revision }],
    // Source file for the service worker logic (caching strategies, fallbacks).
    swSrc: "src/app/sw.ts",
    // Bundle the worker with esbuild directly instead of going through webpack/Turbopack.
    useNativeEsbuild: true,
  });
