/**
 * Decisions behind the one-time install nudge, kept as pure functions so the rule
 * that matters most can be tested outside a browser: who is allowed to be
 * interrupted, and when.
 *
 * `install-nudge.tsx` owns the timer and the banner; `bottom-notices.tsx` owns the
 * order it takes its turn in.
 */

import type {
  InstallAffordance,
  InstallGuideKey,
} from "@/lib/pwa/install-availability";
import { isIndirectInstallGuide } from "@/lib/pwa/install-availability";

/**
 * `localStorage` key recording that the nudge has had its one appearance.
 *
 * `localStorage` rather than `sessionStorage`: "once" has to mean once ever, and a
 * per-tab key would re-ask on every new tab. Versioned like
 * `COOKIE_CONSENT_STORAGE_KEY`, so a future change of wording or policy can
 * deliberately ask again by bumping the suffix instead of silently reinterpreting
 * an old value.
 */
export const INSTALL_NUDGE_STORAGE_KEY = "dokiments-install-nudge-v1";

/**
 * How long the user gets to arrive before the nudge appears.
 *
 * Not a politeness delay — it is what makes the single appearance land on someone
 * who is actually using the app. Firing on mount would put it in the same frame as
 * a dashboard still painting its first data, which is both easy to miss and easy
 * to swat away, and the nudge only gets one try.
 */
export const INSTALL_NUDGE_DELAY_MS = 8_000;

interface StoredInstallNudge {
  seenAt: string;
  version: 1;
}

/**
 * Whether the nudge has already had its turn.
 *
 * Returns `true` on a storage failure, which is the deliberately cautious
 * direction: if the record cannot be read then it also could not have been
 * written, and a nudge that reappears on every visit because Safari is in private
 * mode is far worse than one that never appears. The permanent button is unaffected
 * either way, so nothing is lost.
 */
export const hasSeenInstallNudge = (): boolean => {
  try {
    const stored = window.localStorage.getItem(INSTALL_NUDGE_STORAGE_KEY);

    if (!stored) {
      return false;
    }

    const nudge = JSON.parse(stored) as StoredInstallNudge;
    return nudge.version === 1;
  } catch {
    return true;
  }
};

/** Records the nudge's appearance. Silent on failure — see `hasSeenInstallNudge`. */
export const markInstallNudgeSeen = () => {
  const nudge: StoredInstallNudge = {
    seenAt: new Date().toISOString(),
    version: 1,
  };

  try {
    window.localStorage.setItem(
      INSTALL_NUDGE_STORAGE_KEY,
      JSON.stringify(nudge),
    );
  } catch {
    // Private mode, a full quota, or storage blocked outright. Nothing to do:
    // the nudge stays visible for this page view and simply may return later.
  }
};

type NudgeEligibility = {
  affordance: InstallAffordance;
  /** How installing would have to be done here — see `isIndirectInstallGuide`. */
  guide: InstallGuideKey;
  /** Whether a signed-in user is looking at the app, rather than a visitor. */
  isAuthenticated: boolean;
  isCookieConsentSettled: boolean;
  /** Whether the app-update banner wants the same strip of screen. */
  isUpdateReady: boolean;
};

/**
 * Whether this page view may show the nudge at all.
 *
 * Signed in only, and that is the point of the whole feature: the permanent button
 * is easy to find in the marketing footer and genuinely buried in the dashboard's
 * off-canvas drawer, so the interruption is spent where it is needed. It is also a
 * better ask — someone who has used the product has a reason to install it, where a
 * first-time visitor is being asked to install software they have not tried.
 *
 * `affordance` gates on there being a real install to offer, which also covers the
 * moment after a successful install: it flips to `"hidden"` and the banner leaves.
 * `guide` rules out the contexts where installing means leaving for another browser
 * first — a social app's in-app webview, which is a common way to arrive from a
 * shared link. The one interruption should not be spent on a detour.
 *
 * The two negative conditions are about not being the third thing to talk at once.
 * `CookieConsent` and the update banner occupy this exact strip, and the update
 * banner outranks this one — a stale build is time-sensitive and an install is
 * not. Yielding costs nothing, because a nudge that never appeared is not recorded
 * as seen and gets its turn on a later visit.
 */
export const isInstallNudgeEligible = ({
  affordance,
  guide,
  isAuthenticated,
  isCookieConsentSettled,
  isUpdateReady,
}: NudgeEligibility): boolean =>
  affordance !== "hidden" &&
  !isIndirectInstallGuide(guide) &&
  isAuthenticated &&
  isCookieConsentSettled &&
  !isUpdateReady;
