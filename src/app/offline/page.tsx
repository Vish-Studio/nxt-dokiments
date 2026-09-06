"use client";

import { ArrowClockwiseIcon, WifiSlashIcon } from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";

/**
 * Served by the service worker's `fallbacks` config (see `src/app/sw.ts`)
 * when a document-type navigation fails offline and nothing cached matches.
 * Precached at build time (see `src/app/serwist/[path]/route.ts`) so it is
 * itself available offline.
 */
const OfflinePage = () => (
  <main className="grid min-h-full place-items-center bg-app-panel p-6 text-center">
    <div className="max-w-sm">
      <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-base-200 text-nox-noir/70">
        <WifiSlashIcon
          aria-hidden
          size={28}
          weight="bold"
        />
      </span>
      <h1 className="font-title text-lg font-bold text-nox-noir">
        You&apos;re offline
      </h1>
      <p className="mt-2 text-sm leading-6 text-nox-noir/60">
        Dokiments can&apos;t reach the network right now. Check your connection
        and try again.
      </p>
      <Button
        className="mt-6"
        icon={
          <ArrowClockwiseIcon
            aria-hidden
            size={16}
            weight="bold"
          />
        }
        iconPosition="left"
        onClick={() => window.location.reload()}
      >
        Try again
      </Button>
    </div>
  </main>
);

export default OfflinePage;
