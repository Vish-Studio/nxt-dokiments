"use client";

import { Button } from "@/components/commons/button/button";
import { useAppUpdate } from "@/hooks/use-app-update";
import { useCookieConsentSettled } from "@/hooks/use-cookie-consent-settled";

type AppUpdateBannerViewProps = {
  onReload: () => void;
  onDismiss: () => void;
};

/**
 * The banner itself, with visibility decided by its caller.
 *
 * Split from `AppUpdateBanner` so it can be rendered in isolation: the container
 * reads the live service worker through context, which a story has no way to put a
 * waiting worker into.
 *
 * Deliberately not a dialog. A backdrop would block a user mid-document to ask
 * about a version number, and a full-screen backdrop doubles as a giant dismiss
 * button — one stray click and the notice is gone, which is how the newsletter
 * modal used to lose its opportunity. `aria-live="polite"` announces this without
 * stealing focus.
 */
export const AppUpdateBannerView = ({
  onReload,
  onDismiss,
}: AppUpdateBannerViewProps) => (
  <section
    aria-label="Application update"
    aria-live="polite"
    className="app-update-banner fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5"
  >
    <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-box border border-white/15 bg-nox-noir p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <p className="text-sm leading-6 text-white/70">
        <span className="font-semibold text-white">
          A new version of Dokiments is ready.
        </span>{" "}
        Reload when it suits you — anything you are working on stays as it is
        until you do.
      </p>

      <div className="flex gap-2 sm:shrink-0">
        <Button
          className="border-white/25 bg-transparent text-white hover:bg-white/10"
          onClick={onDismiss}
          size="sm"
          variant="outline"
        >
          Not now
        </Button>
        <Button
          className="border-white/25 bg-white text-nox-noir hover:bg-white/90"
          onClick={onReload}
          size="sm"
          variant="outline"
        >
          Reload
        </Button>
      </div>
    </div>
  </section>
);

/**
 * Offers the user the new build once a worker is waiting.
 *
 * Held back until the cookie choice is settled: `CookieConsent` occupies this same
 * strip at the bottom of the viewport, and asking two unrelated questions in one
 * frame is how a visitor ends up answering neither deliberately. Nothing is lost by
 * waiting — the worker stays waiting too.
 */
export const AppUpdateBanner = () => {
  const { isUpdateReady, acceptUpdate, dismissUpdate } = useAppUpdate();
  const isCookieConsentSettled = useCookieConsentSettled();

  if (!isUpdateReady || !isCookieConsentSettled) {
    return null;
  }

  return (
    <AppUpdateBannerView
      onDismiss={dismissUpdate}
      onReload={acceptUpdate}
    />
  );
};
