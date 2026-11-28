import type { Icon } from "@phosphor-icons/react";
import {
  ArrowLeftIcon,
  BellIcon,
  ChatCircleTextIcon,
  ClockCounterClockwiseIcon,
  CreditCardIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  GearSixIcon,
  HouseIcon,
  ImageIcon,
  LayoutIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SquaresFourIcon,
  StorefrontIcon,
  TicketIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

import { documentSharingEnabled } from "@/lib/sharing/feature-flag";

interface SidebarNavigationItem {
  href: string;
  icon: Icon;
  label: string;
}

/** One labelled group of rows in the admin sidebar ("People", "Content"). */
export interface AdminNavigationSection {
  items: SidebarNavigationItem[];
  /** Small uppercase heading over the rows, or `undefined` for the top group. */
  label?: string;
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

/** The one extra app sidebar row a superadmin sees, above Settings. */
export const adminNavigationItem: SidebarNavigationItem = {
  label: "Admin portal",
  href: "/admin",
  icon: ShieldCheckIcon,
};

/** The admin sidebar's way back to the product, pinned at its foot. */
export const openAppNavigationItem: SidebarNavigationItem = {
  label: "Open app",
  href: "/dashboard",
  icon: ArrowLeftIcon,
};

/**
 * The admin sidebar, grouped the way the tech lead's route table reads.
 *
 * Labels double as `AppShell`'s `activeItem`, so they must stay unique across
 * this list and `sidebarItems` ("Documents" here, "My Documents" there).
 */
export const adminNavigationSections: AdminNavigationSection[] = [
  { items: [{ label: "Overview", href: "/admin", icon: SquaresFourIcon }] },
  {
    label: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: UsersIcon },
      { label: "Plans", href: "/admin/plans", icon: CreditCardIcon },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Templates", href: "/admin/templates", icon: LayoutIcon },
      {
        label: "Marketplace banner",
        href: "/admin/marketplace-banner",
        icon: ImageIcon,
      },
      { label: "Documents", href: "/admin/documents", icon: FileTextIcon },
      // The Sharing pages 404 when sharing is off, so the row goes with them.
      ...(documentSharingEnabled
        ? [{ label: "Sharing", href: "/admin/sharing", icon: ShareNetworkIcon }]
        : []),
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Feedback", href: "/admin/feedback", icon: ChatCircleTextIcon },
      {
        label: "Newsletter",
        href: "/admin/newsletter",
        icon: EnvelopeSimpleIcon,
      },
      { label: "Promotions", href: "/admin/promotions", icon: TicketIcon },
      { label: "Notifications", href: "/admin/notifications", icon: BellIcon },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "System", href: "/admin/system", icon: SlidersHorizontalIcon },
      {
        label: "Audit log",
        href: "/admin/audit",
        icon: ClockCounterClockwiseIcon,
      },
    ],
  },
];

const adminItems = adminNavigationSections.flatMap((section) => section.items);

export const getPageIcon = (label: string): Icon =>
  [...sidebarItems, settingsNavigationItem, ...adminItems].find(
    (item) => item.label === label,
  )?.icon ?? HouseIcon;
