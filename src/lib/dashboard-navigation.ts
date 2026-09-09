import type { Icon } from "@phosphor-icons/react";
import {
  CreditCardIcon,
  FileTextIcon,
  GearSixIcon,
  HouseIcon,
  LayoutIcon,
  StorefrontIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

interface SidebarNavigationItem {
  href: string;
  icon: Icon;
  label: string;
}

export const sidebarItems: SidebarNavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: HouseIcon },
  { label: "My Documents", href: "/my-documents", icon: FileTextIcon },
  { label: "My Templates", href: "/my-templates", icon: LayoutIcon },
  { label: "My Clients", href: "/my-clients", icon: UsersThreeIcon },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: StorefrontIcon,
  },
  { label: "Subscription", href: "/subscription", icon: CreditCardIcon },
];

export const settingsNavigationItem: SidebarNavigationItem = {
  label: "Settings",
  href: "/settings",
  icon: GearSixIcon,
};

export const getPageIcon = (label: string): Icon =>
  [...sidebarItems, settingsNavigationItem].find((item) => item.label === label)?.icon ?? HouseIcon;
