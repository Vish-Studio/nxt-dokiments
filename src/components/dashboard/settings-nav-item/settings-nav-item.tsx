import { GearSix } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";

import SidebarItem from "@/components/dashboard/sidebar-item/sidebar-item";

interface Props {
  isActive?: boolean;
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
}

const SettingsNavItem: FunctionComponent<Props> = ({
  isActive = false,
  isCollapsed = false,
  onCloseMobile,
}) => {
  return (
    <SidebarItem
      className="settings-nav-item"
      icon={GearSix}
      isActive={isActive}
      isCollapsed={isCollapsed}
      href="/settings"
      label="Settings"
      onCloseMobile={onCloseMobile}
    />
  );
};

SettingsNavItem.displayName = "SettingsNavItem";
export default SettingsNavItem;
