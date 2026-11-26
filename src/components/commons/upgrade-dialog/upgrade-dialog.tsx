"use client";

import { CrownIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

import { Button } from "@/components/commons/button/button";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { Modal } from "@/components/commons/modal/modal";
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
 * Explains a plan limit and links to `/subscription`. A brand-toned
 * {@link Modal} with a crown: centred on desktop, a bottom sheet on phones,
 * since it is an optional upsell rather than a decision the user must make.
 * "Maybe later" dismisses it; "View plans" is the main action.
 */
export const UpgradeDialog = ({
  description = "You've reached the 2-template limit on the free plan. Upgrade your account to save more templates.",
  onClose,
  open,
  reason,
  title = "Upgrade to add more templates",
}: UpgradeDialogProps) => {
  useEffect(() => {
    if (open) {
      trackEvent("upgrade_dialog_opened", { reason });
    }
  }, [open, reason]);

  return (
    <Modal
      actions={
        <>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            Maybe later
          </Button>
          <LinkButton
            analytics={{
              event: "cta_click",
              params: { placement: "upgrade_dialog" },
            }}
            href="/subscription"
            onClick={onClose}
            size="sm"
          >
            View plans
          </LinkButton>
        </>
      }
      className="upgrade-dialog"
      description={description}
      icon={CrownIcon}
      onClose={onClose}
      open={open}
      title={title}
      tone="brand"
    />
  );
};

export default UpgradeDialog;
