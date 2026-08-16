"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useSessionQuery } from "@/hooks/queries/use-session";
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
} from "@/lib/analytics/events";
import { clearUserId, setUserId } from "@/lib/analytics/gtag";
import { trackEvent } from "@/lib/analytics/track";

export type AnalyticsProviderProps = {
  children: ReactNode;
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
 * Two jobs:
 * 1. Delegated click tracking — a single capture-phase listener resolves
 *    `[data-analytics-event]` via `closest`, which lets `Button`/`LinkButton`
 *    stay server-renderable and ship zero JS while still declaring
 *    analytics as plain data.
 * 2. GA4 User-ID mirroring — reads `useSessionQuery` rather than
 *    `useAuthStore`, since the store is documented as transitional in
 *    `auth-provider.tsx`.
 *
 * Follows the `AuthProvider` shape exactly: returns `children` with no
 * wrapper element and no React Context.
 */
export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const { data: user, isLoading } = useSessionQuery();

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
