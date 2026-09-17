"use client";

import { LightbulbIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import type { FunctionComponent } from "react";
import { useState } from "react";

import { FeedbackDialog } from "@/components/commons/feedback-dialog/feedback-dialog";
import {
  sidebarRowClassName,
  sidebarRowLabelClassName,
} from "@/components/dashboard/sidebar-item/sidebar-item";

interface Props {
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
}

const LABEL = "Send feedback";

/**
 * The sidebar row that opens {@link FeedbackDialog}, and the owner of its open
 * state.
 *
 * Lives in the sidebar rather than on a page or behind the floating action button
 * for two reasons. The app shell wraps every authenticated screen, so one mount
 * here reaches the whole product — feedback is most valuable at the moment of
 * friction, and a destination the user has to navigate to loses the report that
 * mattered. And the floating action button is already the primary action on
 * Dashboard, My Documents and My Clients ("New document", "Add client"), so a
 * second button there would compete with it.
 *
 * A `<button>` rather than the `SidebarItem` link, since this opens a dialog and
 * navigates nowhere — but it borrows `SidebarItem`'s own classes so the two are
 * visually identical and stay that way.
 */
const SidebarFeedback: FunctionComponent<Props> = ({
  isCollapsed = false,
  onCloseMobile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const open = () => {
    // Closes the mobile drawer as it opens the dialog, matching what tapping any
    // other row does. Leaving the drawer up would put the dialog behind it.
    onCloseMobile?.();
    setIsOpen(true);
  };

  return (
    <>
      <button
        className={sidebarRowClassName({ isCollapsed })}
        onClick={open}
        title={isCollapsed ? LABEL : undefined}
        type="button"
      >
        <LightbulbIcon
          aria-hidden
          className="shrink-0"
          size={19}
          weight="bold"
        />
        <span className={sidebarRowLabelClassName(isCollapsed)}>{LABEL}</span>
      </button>

      <FeedbackDialog
        onClose={() => setIsOpen(false)}
        open={isOpen}
        path={pathname}
      />
    </>
  );
};

SidebarFeedback.displayName = "SidebarFeedback";
export default SidebarFeedback;
