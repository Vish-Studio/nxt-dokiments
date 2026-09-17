"use client";

import { useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics/track";
import { activePromoCode } from "@/lib/promo/promo-codes";
import {
  isPromoStatus,
  PROMO_STATUS_PARAM,
  promoStatusFeedback,
} from "@/lib/promo/promo-status";
import type { PromoStatus } from "@/types/promo";

export type PromoStatusBannerProps = {
  /**
   * Outcome to render, overriding the `?promo=` param. Pass this to show a fixed
   * state (stories, tests) without depending on the URL — the same escape hatch
   * `SignInForm`'s `notice` prop provides.
   */
  status?: PromoStatus;
};

/**
 * Reports what happened to a promo code submitted during sign-in or sign-up.
 *
 * Mounted once by `AppShell`, so it works for any post-authentication destination
 * rather than just `/dashboard` (`next` can point anywhere protected).
 *
 * Reads `window.location.search` inside a deferred effect rather than using
 * `useSearchParams`, matching `SignInForm` — the codebase avoids that hook, and
 * reading after mount keeps the server and client markup identical.
 *
 * The param is a display hint only, and a user-editable one: it decides which
 * sentence appears here and nothing else. The Settings card is what reads the
 * authoritative redemption record.
 */
export const PromoStatusBanner = ({ status }: PromoStatusBannerProps) => {
  const [urlStatus, setUrlStatus] = useState<PromoStatus | null>(null);
  const reported = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = new URLSearchParams(window.location.search).get(
        PROMO_STATUS_PARAM,
      );
      setUrlStatus(isPromoStatus(value) ? value : null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const active = status ?? urlStatus;

  useEffect(() => {
    if (!active || reported.current) return;
    reported.current = true;

    if (active === "applied") {
      trackEvent("promo_code_applied", {
        promo_id: activePromoCode.id,
        surface: "auth",
      });
      return;
    }

    // `failed` is deliberately not reported as a rejection: nothing was decided
    // about the code, so counting it would overstate how often codes are refused.
    if (active === "already_redeemed" || active === "invalid") {
      trackEvent("promo_code_failed", { reason: active, surface: "auth" });
    }
  }, [active]);

  if (!active) return null;

  const { message, tone } = promoStatusFeedback(active);

  return (
    <div
      className={
        tone === "success"
          ? "promo-status-banner mb-4 rounded-box bg-success/10 px-4 py-3 text-sm text-success"
          : "promo-status-banner mb-4 rounded-box bg-error/10 px-4 py-3 text-sm text-error"
      }
      role={tone === "success" ? "status" : "alert"}
    >
      {message}
    </div>
  );
};
