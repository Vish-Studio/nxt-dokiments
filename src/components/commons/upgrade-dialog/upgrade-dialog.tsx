"use client";

import { CrownIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";

import { BottomSheet } from "@/components/commons/bottom-sheet/bottom-sheet";
import { Button } from "@/components/commons/button/button";
import { phoneMediaQuery, useMediaQuery } from "@/hooks/use-media-query";
import { toAnalyticsAttributes } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";

export type UpgradeDialogProps = {
  description?: string;
  onClose: () => void;
  open: boolean;
  /** Which limit triggered this dialog — carried on the `upgrade_dialog_opened` event. */
  reason: "saved_template_limit" | "share_limit" | "tier_locked";
  title?: string;
};

/**
 * Explains a plan limit and links to `/subscription`. A centred dialog on
 * desktop; on phones a {@link BottomSheet}, since it is an optional upsell
 * rather than a decision the user must make.
 */
export const UpgradeDialog = ({
  description = "You've reached the 2-template limit on the free plan. Upgrade your account to save more templates.",
  onClose,
  open,
  reason,
  title = "Upgrade to add more templates",
}: UpgradeDialogProps) => {
  const isPhone = useMediaQuery(phoneMediaQuery);

  useEffect(() => {
    if (open) {
      trackEvent("upgrade_dialog_opened", { reason });
    }
  }, [open, reason]);

  // The phone sheet handles Escape and the scroll lock itself.
  useEffect(() => {
    if (!open || isPhone) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, isPhone, onClose]);

  if (!open) {
    return null;
  }

  const viewPlansLink = (
    <Link
      className="btn btn-primary font-title font-semibold tracking-normal"
      href="/subscription"
      onClick={onClose}
      {...toAnalyticsAttributes({
        event: "cta_click",
        params: { placement: "upgrade_dialog" },
      })}
    >
      View plans
    </Link>
  );

  if (isPhone) {
    return (
      <BottomSheet
        actions={
          <>
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
            >
              Maybe later
            </Button>
            {viewPlansLink}
          </>
        }
        description={description}
        icon={
          <span className="flex size-10 items-center justify-center rounded-full bg-golden-harvest text-nox-noir">
            <CrownIcon
              aria-hidden
              size={20}
              weight="bold"
            />
          </span>
        }
        onClose={onClose}
        open
        title={title}
      />
    );
  }

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-nox-noir/55"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 w-full max-w-sm rounded-box border border-steel-mist bg-base-100 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-golden-harvest text-nox-noir">
          <CrownIcon
            aria-hidden
            size={24}
            weight="bold"
          />
        </div>
        <h3 className="mt-4 font-title text-lg font-bold text-nox-noir">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-nox-noir/60">{description}</p>

        <div className="mt-6 grid gap-2">
          {viewPlansLink}
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
};
