"use client";

import { AppUpdateBannerView } from "@/components/commons/app-update-banner/app-update-banner";
import { InstallNudge } from "@/components/commons/install-nudge/install-nudge";
import { useAppUpdate } from "@/hooks/use-app-update";
import { useCookieConsentSettled } from "@/hooks/use-cookie-consent-settled";

/**
 * Keeps the notices along the bottom of the viewport from talking over each other.
 *
 * Three things want that strip — `CookieConsent`, the app-update banner, and the
 * one-time install nudge — and all three are `fixed inset-x-0 bottom-0 z-50`, so
 * any two showing at once means one silently covers the other. Asking two
 * unrelated questions in one frame is also how a visitor ends up answering neither
 * deliberately.
 *
 * Each notice still owns its own conditions; the only thing decided here is who
 * outranks whom. The update banner wins, because a stale build is time-sensitive
 * where an install is not, and the nudge yields for free: one that never appeared
 * is not recorded as seen and gets its turn on a later visit. `CookieConsent`
 * needs no entry here — it renders itself and nothing else may appear until it is
 * answered.
 *
 * This component also exists because `useAppUpdate` must be mounted exactly once —
 * it polls for new workers and can reload the page — so the update state is read
 * here and handed down rather than read a second time inside the nudge.
 */
export const BottomNotices = () => {
  const { isUpdateReady, acceptUpdate, dismissUpdate } = useAppUpdate();
  const isCookieConsentSettled = useCookieConsentSettled();

  return (
    <>
      {isUpdateReady && isCookieConsentSettled ? (
        <AppUpdateBannerView
          onDismiss={dismissUpdate}
          onReload={acceptUpdate}
        />
      ) : null}

      {/*
        Mounted even while the update banner holds the strip, rather than rendered
        in an `else`. The nudge waits out a delay before appearing, and unmounting
        it would throw that away and start again from zero every time an update
        banner came and went. It hides itself on `isUpdateReady` instead.
      */}
      <InstallNudge isUpdateReady={isUpdateReady} />
    </>
  );
};
