"use client";

import { GiftIcon } from "@phosphor-icons/react";

import { activePromoCode } from "@/lib/promo/promo-codes";

/**
 * Launch-offer callout shown with the promo field on the sign-in and sign-up forms.
 *
 * Reuses `PublicLaunchBanner`'s golden treatment so the launch messaging looks the
 * same before and after sign-in. Carries no ARIA role on purpose: it is static
 * marketing copy present on first paint, and `role="status"` would make it a live
 * region that assistive tech announces as though something had just happened.
 *
 * The code is rendered from the registry rather than written into the markup, so
 * the advertised code and the one the server accepts cannot drift apart.
 */
export const PromoCodeCallout = () => (
  <div className="flex items-start gap-3 rounded-box border border-golden-harvest/40 bg-golden-harvest/10 p-4">
    <GiftIcon
      aria-hidden
      className="mt-0.5 shrink-0 text-nox-noir"
      size={20}
      weight="fill"
    />
    <div className="min-w-0">
      <p className="font-title text-sm font-bold text-nox-noir">
        {activePromoCode.label}
      </p>
      <p className="mt-1 text-sm leading-6 text-nox-noir/70">
        Use promo code{" "}
        <span className="font-title font-bold text-nox-noir">
          {activePromoCode.code}
        </span>{" "}
        to unlock the current launch offer.
      </p>
    </div>
  </div>
);
