"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useSessionQuery } from "@/hooks/queries/use-session";
import {
  analyticsConfig,
  hasClarityConfig,
  hasMetaPixelConfig,
} from "@/lib/analytics/config";
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
} from "@/lib/analytics/events";
import { clearUserId, setUserId } from "@/lib/analytics/gtag";
import {
  loadMetaPixel,
  revokeMetaPixelConsent,
  trackMetaPageView,
} from "@/lib/analytics/meta-pixel";
import { trackEvent } from "@/lib/analytics/track";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsent,
} from "@/lib/cookie-consent";

export type AnalyticsProviderProps = {
  children: ReactNode;
};

type ClarityConsentStorage = "granted" | "denied";

type ClarityCommand = ((...args: unknown[]) => void) & {
  q?: unknown[][];
};

declare global {
  interface Window {
    clarity?: ClarityCommand;
  }
}

/**
 * Creates the command queue used by Clarity before its remote script is ready.
 * Keeping the queue local lets consent be recorded before the script finishes
 * loading, and avoids loading the remote script at all without permission.
 */
const getClarityCommand = (): ClarityCommand => {
  if (window.clarity) {
    return window.clarity;
  }

  const clarity: ClarityCommand = (...args) => {
    clarity.q = clarity.q ?? [];
    clarity.q.push(args);
  };

  window.clarity = clarity;
  return clarity;
};

const updateClarityConsent = (analyticsStorage: ClarityConsentStorage) => {
  getClarityCommand()("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: analyticsStorage,
  });
};

const loadClarity = () => {
  if (
    !hasClarityConfig() ||
    document.querySelector('script[data-clarity-loader="true"]')
  ) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${analyticsConfig.clarityProjectId}`;
  script.dataset.clarityLoader = "true";
  document.head.append(script);
};

/**
 * Reads a tracking instruction off a clicked element's data attributes.
 *
 * The instruction crosses the server/client boundary as JSON in an
 * attribute, so it arrives untyped and is cast back at this single choke
 * point rather than with `any` at every call site. A malformed payload is
 * dropped silently — a broken analytics attribute must never break a click.
 */
const readAnalyticsTrigger = (element: HTMLElement) => {
  const event = element.dataset.analyticsEvent as
    | AnalyticsEventName
    | undefined;

  if (!event) {
    return null;
  }

  try {
    const raw = element.dataset.analyticsParams;
    const params = (
      raw ? JSON.parse(raw) : {}
    ) as AnalyticsEventMap[typeof event];

    return { event, params };
  } catch {
    return null;
  }
};

/**
 * Root analytics provider. Mount once in the root layout, inside
 * `QueryProvider` (it reads the session via `useSessionQuery`).
 *
 * Three jobs:
 * 1. Delegated click tracking — a single capture-phase listener resolves
 *    `[data-analytics-event]` via `closest`, which lets `Button`/`LinkButton`
 *    stay server-renderable and ship zero JS while still declaring
 *    analytics as plain data.
 * 2. Consent-gated loading of the two optional third-party tags, Clarity and
 *    the Meta Pixel. Neither script is requested until a visitor chooses
 *    "Accept all"; both react to a later change of mind.
 * 3. GA4 User-ID mirroring — reads `useSessionQuery` rather than
 *    `useAuthStore`, since the store is documented as transitional in
 *    `auth-provider.tsx`.
 *
 * Follows the `AuthProvider` shape exactly: returns `children` with no
 * wrapper element and no React Context.
 */
export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const { data: user, isLoading } = useSessionQuery();
  /**
   * Drives the Meta Pixel's per-navigation `PageView`. `usePathname` only —
   * `useSearchParams` in a root-layout client component would opt every
   * otherwise-static route into dynamic rendering unless wrapped in
   * `Suspense`, which is far too high a price for counting a `?tab=` change
   * as a separate page view.
   */
  const pathname = usePathname();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const host = target.closest<HTMLElement>("[data-analytics-event]");
      const trigger = host ? readAnalyticsTrigger(host) : null;

      if (trigger) {
        trackEvent(trigger.event, trigger.params);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!hasClarityConfig()) {
      return;
    }

    const applyClarityConsent = () => {
      const hasAnalyticsConsent = readCookieConsent() === "all";
      updateClarityConsent(hasAnalyticsConsent ? "granted" : "denied");

      if (hasAnalyticsConsent) {
        loadClarity();
      }
    };

    applyClarityConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, applyClarityConsent);

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        applyClarityConsent,
      );
    };
  }, []);

  /**
   * Loads the Meta Pixel on consent and sends exactly one `PageView` per
   * route.
   *
   * Keyed on `pathname` rather than mounted once, because Meta's base code
   * only fires `PageView` on a full document load and App Router client
   * navigations are not that. Re-running the whole effect per navigation is
   * what keeps the count exact: the body runs once per commit, and the
   * consent listener only fires when the visitor actually changes their
   * choice — so neither path can double-count the other's page view.
   *
   * Known gap, verified against the live `fbevents.js` rather than assumed: a
   * visitor who accepts, withdraws, then accepts again *without navigating*
   * loses that last `PageView` to Meta's own duplicate suppression. Ordinary
   * events resume immediately and the next navigation is counted normally, so
   * this is left alone — the alternative is passing a synthetic `eventID` to
   * defeat a dedupe rule Meta does not document, which would then collide with
   * the meaning `eventID` carries if the Conversions API is ever added.
   */
  useEffect(() => {
    if (!hasMetaPixelConfig()) {
      return;
    }

    const applyMetaPixelConsent = () => {
      if (readCookieConsent() !== "all") {
        revokeMetaPixelConsent();
        return;
      }

      loadMetaPixel();
      trackMetaPageView();
    };

    applyMetaPixelConsent();
    window.addEventListener(
      COOKIE_CONSENT_CHANGED_EVENT,
      applyMetaPixelConsent,
    );

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        applyMetaPixelConsent,
      );
    };
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      setUserId(user.uid);
    } else {
      clearUserId();
    }
  }, [isLoading, user]);

  return children;
};
