"use client";

import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";

import type { ButtonProps } from "@/components/commons/button/button";
import { Button } from "@/components/commons/button/button";
import { Modal } from "@/components/commons/modal/modal";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import type { AnalyticsEventMap } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";
import type { InstallGuideKey } from "@/lib/pwa/install-availability";

/** Where the button is mounted, carried on both install events. */
export type InstallSurface =
  AnalyticsEventMap["app_install_prompted"]["surface"];

type InstallGuideCopy = {
  steps: string[];
  title: string;
};

/**
 * What to tell the user on each browser that cannot be asked programmatically.
 *
 * Every one of these can install a web app — the command is just buried in a menu
 * whose name differs per browser, hence one entry each rather than a single
 * generic paragraph. `browser-menu` is the honest fallback: it also covers desktop
 * Firefox, which cannot install at all, so it deliberately says "look for" rather
 * than promising an item that may not be there.
 */
const INSTALL_GUIDES: Record<InstallGuideKey, InstallGuideCopy> = {
  ios: {
    title: "Add Dokiments to your Home Screen",
    steps: [
      "Tap the Share button in the browser toolbar.",
      "Scroll down the share sheet and choose “Add to Home Screen”.",
      "Tap “Add” to confirm.",
    ],
  },
  // The extra step is the whole point: an in-app browser has no share sheet to add
  // anything from, so the `ios` wording above would send the user looking for a
  // button that is not there.
  "ios-in-app-browser": {
    title: "Open Dokiments in Safari to install",
    steps: [
      "Tap the menu button in this browser bar.",
      "Choose “Open in Safari”, or “Open in browser”.",
      "In Safari, tap Share, then “Add to Home Screen”.",
    ],
  },
  "safari-desktop": {
    title: "Add Dokiments to your Dock",
    steps: [
      "Open the Share menu in Safari’s toolbar.",
      "Choose “Add to Dock”.",
      "Check the name, then click “Add”.",
    ],
  },
  "firefox-android": {
    title: "Install Dokiments",
    steps: [
      "Open the browser menu.",
      "Choose “Install” or “Add to Home screen”.",
      "Confirm to finish.",
    ],
  },
  "browser-menu": {
    title: "Install Dokiments",
    steps: [
      "Open your browser’s menu.",
      "Look for “Install app”, “Install Dokiments”, or “Add to Home screen”.",
      "Confirm to finish.",
    ],
  },
};

export type InstallInstructionsDialogProps = {
  guide: InstallGuideKey;
  onClose: () => void;
  open: boolean;
};

/**
 * The manual instructions, for browsers with no install API: an info-toned
 * {@link Modal} with the numbered steps as its body, centred on desktop and a
 * bottom sheet on phones (like the OS's own install sheets).
 *
 * `Modal` renders through a portal, which matters here more than anywhere: this
 * is the only dialog opened from a button whose position is not fixed by design.
 * The footer is such a surface: its columns carry `.website-reveal`, whose
 * reveal animation leaves a residual `transform`, and a transformed ancestor
 * becomes the containing block for `position: fixed`. Without the portal the
 * backdrop would cover that column instead of the viewport and the footer's
 * `overflow-hidden` ancestors would clip the panel.
 */
export const InstallInstructionsDialog = ({
  guide,
  onClose,
  open,
}: InstallInstructionsDialogProps) => {
  const { steps, title } = INSTALL_GUIDES[guide];

  return (
    <Modal
      actions={
        <Button
          onClick={onClose}
          size="sm"
          variant="primary"
        >
          Got it
        </Button>
      }
      className="install-instructions-dialog"
      description="Installed, Dokiments opens in its own window and keeps working when you lose signal."
      icon={DownloadSimpleIcon}
      onClose={onClose}
      open={open}
      title={title}
      tone="info"
    >
      <ol className="grid gap-3">
        {steps.map((step, index) => (
          <li
            className="flex gap-3 text-sm leading-6 text-nox-noir/75"
            key={step}
          >
            <span
              aria-hidden
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-base-200 font-title text-xs font-bold text-nox-noir"
            >
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </Modal>
  );
};

export type InstallAppButtonViewProps = {
  className?: string;
  guide: InstallGuideKey;
  label?: string;
  /**
   * `"prompt"` opens the browser's own install dialog through `onInstall`;
   * `"guide"` opens {@link InstallInstructionsDialog} instead. `"hidden"` is not
   * accepted — the container renders nothing in that case.
   */
  mode: "guide" | "prompt";
  onGuideOpen?: () => void;
  onInstall: () => void;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
};

/**
 * The button and its dialog, with the install decision made by its caller.
 *
 * Split from `InstallAppButton` so it can be rendered in isolation: the container
 * reads live browser state that a story has no way to fake — a captured
 * `beforeinstallprompt` cannot be synthesised at all.
 *
 * Both modes wear the same label. The user asked to install the app; whether that
 * takes one tap or three is the browser's doing, and surfacing it in the label
 * ("Install app" versus "How to install") would only ask them to care.
 */
export const InstallAppButtonView = ({
  className,
  guide,
  label = "Install app",
  mode,
  onGuideOpen,
  onInstall,
  size = "sm",
  variant = "outline",
}: InstallAppButtonViewProps) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleClick = () => {
    if (mode === "prompt") {
      onInstall();
      return;
    }

    onGuideOpen?.();
    setIsGuideOpen(true);
  };

  return (
    <>
      <Button
        className={className}
        icon={
          <DownloadSimpleIcon
            aria-hidden
            size={16}
            weight="bold"
          />
        }
        iconPosition="left"
        onClick={handleClick}
        size={size}
        variant={variant}
      >
        {label}
      </Button>

      <InstallInstructionsDialog
        guide={guide}
        onClose={() => setIsGuideOpen(false)}
        open={isGuideOpen}
      />
    </>
  );
};

export type InstallAppButtonProps = Omit<
  InstallAppButtonViewProps,
  "guide" | "mode" | "onGuideOpen" | "onInstall"
> & {
  surface: InstallSurface;
};

/**
 * Offers to install Dokiments to the device, when there is an install to offer.
 *
 * Renders nothing at all when the app is already installed or the browser has
 * judged the site not installable — a dead "Install app" button is worse than no
 * button, and this is the common case on a repeat visit from an installed app.
 *
 * The permanent, always-findable half of the feature. `InstallNudge` is the other
 * half — it interrupts once, for a signed-in user, because this button is buried in
 * an off-canvas drawer on a phone. The two are complements: the nudge can afford to
 * be shown a single time precisely because this never goes away, so a user who
 * ignored it has somewhere to come back to.
 */
export const InstallAppButton = ({
  surface,
  ...viewProps
}: InstallAppButtonProps) => {
  const { affordance, guide, promptInstall } = useInstallPrompt();

  if (affordance === "hidden") {
    return null;
  }

  const handleInstall = async () => {
    const outcome = await promptInstall();

    // `null` means the event was spent between render and click — nothing was
    // shown, so there is no outcome to report.
    if (outcome) {
      trackEvent("app_install_prompted", { outcome, surface });
    }
  };

  return (
    <InstallAppButtonView
      {...viewProps}
      guide={guide}
      mode={affordance}
      onGuideOpen={() =>
        trackEvent("app_install_guide_opened", { platform: guide, surface })
      }
      onInstall={handleInstall}
    />
  );
};
