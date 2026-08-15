"use client";

import { MegaphoneIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { tierLocksDisabled } from "@/lib/market-place";
import {
  readPublicLaunchBannerDismissed,
  writePublicLaunchBannerDismissed,
} from "@/lib/public-launch-banner";

export const PublicLaunchBanner = () => {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const initialStateTimer = window.setTimeout(() => {
      setIsDismissed(readPublicLaunchBannerDismissed());
    }, 0);

    return () => window.clearTimeout(initialStateTimer);
  }, []);

  if (!tierLocksDisabled || isDismissed) {
    return null;
  }

  const dismiss = () => {
    writePublicLaunchBannerDismissed();
    setIsDismissed(true);
  };

  return (
    <div
      className="mb-4 flex items-start gap-3 rounded-2xl border border-golden-harvest/40 bg-golden-harvest/10 p-4 text-sm text-nox-noir"
      role="status"
    >
      <MegaphoneIcon
        aria-hidden
        className="mt-0.5 shrink-0 text-golden-harvest"
        size={20}
        weight="fill"
      />
      <p className="flex-1 leading-6">
        All templates are unlocked during our public launch — pick from any
        tier. You can still save up to 2 templates to your account.
      </p>
      <ButtonIcon
        aria-label="Dismiss announcement"
        icon={<XIcon aria-hidden size={16} weight="bold" />}
        onClick={dismiss}
        size="sm"
        variant="ghost"
      />
    </div>
  );
};
