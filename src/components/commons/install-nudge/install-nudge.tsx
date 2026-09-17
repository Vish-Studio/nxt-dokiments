"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/commons/button/button";
import type { InstallAppButtonViewProps } from "@/components/commons/install-app-button/install-app-button";
import { InstallAppButtonView } from "@/components/commons/install-app-button/install-app-button";
import { useCookieConsentSettled } from "@/hooks/use-cookie-consent-settled";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { trackEvent } from "@/lib/analytics/track";
import {
  hasSeenInstallNudge,
  INSTALL_NUDGE_DELAY_MS,
  isInstallNudgeEligible,
  markInstallNudgeSeen,
} from "@/lib/pwa/install-nudge-policy";
import { useAuthStore } from "@/stores/auth-store";

export type InstallNudgeViewProps = Pick<
  InstallAppButtonViewProps,
  "guide" | "mode" | "onGuideOpen" | "onInstall"
> & {
  onDismiss: () => void;
};

/**
 * The nudge itself, with visibility decided by its caller.
 *
 * Split from `InstallNudge` so it can be rendered in isolation: the container
 * depends on a timer, `localStorage`, and a captured `beforeinstallprompt` that a
 * story cannot synthesise.
 *
 * Modelled on `AppUpdateBannerView` down to the classes, because it takes turns
 * with it on the same strip of screen and the two should not look like different
 * kinds of thing. Deliberately not a dialog, for the same reasons: a backdrop
 * would block someone mid-document to ask about a convenience, and a full-screen
 * backdrop doubles as a giant dismiss button. `aria-live="polite"` announces it
 * without stealing focus.
 *
 * The call to action is `InstallAppButtonView`, not a local button — it already
 * knows how to either ask the browser or explain the manual route, and it brings
 * the instructions dialog with it. On iOS, which has no install API at all, that
 * dialog is the entire point of the nudge.
 */
export const InstallNudgeView = ({
  guide,
  mode,
  onDismiss,
  onGuideOpen,
  onInstall,
}: InstallNudgeViewProps) => (
  <section
    aria-label="Install Dokiments"
    aria-live="polite"
    className="install-nudge fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5"
  >
    <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-box border border-white/15 bg-nox-noir p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <p className="text-sm leading-6 text-white/70">
        <span className="font-semibold text-white">
          Keep Dokiments one tap away.
        </span>{" "}
        Add it to your device and it opens in its own window, straight from your
        home screen — and keeps working when you lose signal.
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
        <InstallAppButtonView
          className="border border-white/25 bg-white text-nox-noir hover:bg-white/90 hover:text-nox-noir"
          guide={guide}
          mode={mode}
          onGuideOpen={onGuideOpen}
          onInstall={onInstall}
          variant="ghost"
        />
      </div>
    </div>
  </section>
);

/**
 * Offers the install once, to a signed-in user, then never again.
 *
 * Exists because the permanent button is not discoverable enough on a phone: in
 * the dashboard it lives in the account card at the bottom of an off-canvas
 * drawer, which a user has to already be looking for. This is the one interruption
 * the feature allows itself.
 *
 * "Once" is recorded the moment it appears rather than when it is answered, so a
 * user who wanders off is not asked again on their next visit. That is only safe
 * because the button stays: nothing is permanently lost by a nudge that went
 * unread, which is what makes a single, unconditional appearance the honest
 * behaviour rather than a nag with extra steps.
 *
 * Mount through `BottomNotices`, which decides when this may take its turn.
 */
export const InstallNudge = ({
  delayMs = INSTALL_NUDGE_DELAY_MS,
  isUpdateReady,
}: {
  /**
   * Overridable only so a story can watch the once-per-browser guarantee without
   * waiting out the real delay, the same way `shouldCheckForUpdate` takes an
   * `intervalMs`. Production leaves it alone.
   */
  delayMs?: number;
  /** Whether the update banner is claiming the strip this shares with it. */
  isUpdateReady: boolean;
}) => {
  const { affordance, guide, promptInstall } = useInstallPrompt();
  const isAuthenticated =
    useAuthStore((state) => state.status) === "authenticated";
  const isCookieConsentSettled = useCookieConsentSettled();
  const [isVisible, setIsVisible] = useState(false);

  const isEligible = isInstallNudgeEligible({
    affordance,
    guide,
    isAuthenticated,
    isCookieConsentSettled,
    isUpdateReady,
  });

  useEffect(() => {
    // `hasSeenInstallNudge` reads `localStorage`, so it has to happen here rather
    // than during render — the server cannot know the answer.
    if (!isEligible || hasSeenInstallNudge()) {
      return;
    }

    const timer = setTimeout(() => setIsVisible(true), delayMs);

    // Clears if the user signs out, installs, or an update banner arrives during
    // the wait. The record is untouched, so the nudge still has its turn later.
    return () => clearTimeout(timer);
  }, [delayMs, isEligible]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    markInstallNudgeSeen();
    trackEvent("app_install_nudge_shown", {});
  }, [isVisible]);

  // Re-checked on every render, not just at the timer: an install completed from
  // the browser's own menu, or a sign-out, has to take the banner with it. The
  // `"hidden"` test is redundant with `isEligible` but narrows the affordance to
  // the two modes the view accepts.
  if (!isVisible || !isEligible || affordance === "hidden") {
    return null;
  }

  const dismiss = () => {
    trackEvent("app_install_nudge_dismissed", {});
    setIsVisible(false);
  };

  const handleInstall = async () => {
    const outcome = await promptInstall();

    if (outcome) {
      trackEvent("app_install_prompted", { outcome, surface: "nudge" });
    }

    // Closes on either answer. Accepting makes the affordance `"hidden"` anyway,
    // but declining should not leave the banner sitting there having been answered.
    setIsVisible(false);
  };

  return (
    <InstallNudgeView
      guide={guide}
      mode={affordance}
      onDismiss={dismiss}
      onGuideOpen={() =>
        trackEvent("app_install_guide_opened", {
          platform: guide,
          surface: "nudge",
        })
      }
      onInstall={handleInstall}
    />
  );
};
