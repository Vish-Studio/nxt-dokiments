"use client";

import { CompassIcon } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";

import {
  sidebarRowClassName,
  sidebarRowLabelClassName,
} from "@/components/dashboard/sidebar-item/sidebar-item";
import { useUiStore } from "@/stores/ui-store";

interface Props {
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
}

const LABEL = "Getting started";

/**
 * The sidebar row that reopens the onboarding tour a new user sees after sign-up.
 *
 * A `<button>` styled with `SidebarItem`'s classes, like `SidebarFeedback`, since
 * it opens a dialog rather than navigating. Unlike that row it does not own the
 * dialog: the tour also opens on arrival after sign-up, so its state lives in
 * `ui-store` and `OnboardingLauncher` renders it.
 */
const SidebarOnboarding: FunctionComponent<Props> = ({
  isCollapsed = false,
  onCloseMobile,
}) => {
  const openOnboarding = useUiStore((state) => state.openOnboarding);

  const open = () => {
    // Close the mobile drawer first so the tour is not opened behind it.
    onCloseMobile?.();
    openOnboarding();
  };

  return (
    <button
      className={sidebarRowClassName({ isCollapsed })}
      onClick={open}
      title={isCollapsed ? LABEL : undefined}
      type="button"
    >
      <CompassIcon
        aria-hidden
        className="shrink-0"
        size={19}
        weight="bold"
      />
      <span className={sidebarRowLabelClassName(isCollapsed)}>{LABEL}</span>
    </button>
  );
};

SidebarOnboarding.displayName = "SidebarOnboarding";
export default SidebarOnboarding;
