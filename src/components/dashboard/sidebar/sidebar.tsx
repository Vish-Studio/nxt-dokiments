import type { Icon } from "@phosphor-icons/react";
import {
  CreditCardIcon,
  FileTextIcon,
  GearSixIcon,
  HouseIcon,
  LayoutIcon,
  SidebarIcon,
  StorefrontIcon,
  UsersThreeIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { FunctionComponent } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import SidebarAccount from "@/components/dashboard/sidebar-account/sidebar-account";
import SidebarItem from "@/components/dashboard/sidebar-item/sidebar-item";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface SidebarNavigationItem {
  href: string;
  icon: Icon;
  label: string;
}

interface Props {
  activeItem?: string;
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}

const sidebarItems: SidebarNavigationItem[] = [
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

const Sidebar: FunctionComponent<Props> = ({
  activeItem = "Dashboard",
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={cn(
        "sidebar fixed inset-y-0 left-0 z-70 flex w-70 shrink-0 flex-col bg-app-chrome px-5 pt-6 lg:pt-9 pb-5 text-app-chrome-content transition-all duration-300 lg:static lg:z-auto lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "lg:w-24" : "lg:w-60",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          isCollapsed && "lg:justify-center",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label={isCollapsed ? "Expand sidebar" : "Dokiments home"}
            className={cn(
              "size-8 shrink-0 items-center justify-center transition-transform hover:scale-105",
              isCollapsed ? "hidden lg:flex" : "hidden",
            )}
            onClick={isCollapsed ? onToggleCollapse : undefined}
            type="button"
          >
            <Image
              src={"/images/svg/icon-white.svg"}
              width={100}
              height={100}
              alt="Dokiments icon"
            />
          </button>

          <Link
            className={cn(
              "items-center gap-3",
              isCollapsed ? "flex lg:hidden" : "flex",
            )}
            aria-label="Dokiments home"
            href="/"
          >
            <Image
              className={cn("mb-1")}
              src={"/images/svg/logo-white.svg"}
              width={120}
              height={120}
              alt="Dokiments logo"
            />
          </Link>
        </div>
        {isCollapsed && !isMobileOpen ? null : (
          <ButtonIcon
            aria-label={isMobileOpen ? "Close navigation" : "Collapse sidebar"}
            className="border-none text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content"
            icon={
              <>
                <span className="lg:hidden">
                  <XIcon
                    aria-hidden
                    size={16}
                    weight="bold"
                  />
                </span>
                <span className="hidden lg:inline-flex">
                  <SidebarIcon
                    aria-hidden
                    size={16}
                    weight="bold"
                  />
                </span>
              </>
            }
            onClick={isMobileOpen ? onCloseMobile : onToggleCollapse}
            size="sm"
            variant="ghost"
          />
        )}
      </div>

      <nav className="mt-10 grid gap-3">
        {sidebarItems.map((item) => (
          <SidebarItem
            {...item}
            isActive={item.label === activeItem}
            isCollapsed={isCollapsed}
            key={item.label}
            onCloseMobile={onCloseMobile}
          />
        ))}
      </nav>

      <div className="mt-auto grid gap-3 pt-8">
        <SidebarItem
          href="/settings"
          icon={GearSixIcon}
          isActive={activeItem === "Settings"}
          isCollapsed={isCollapsed}
          label="Settings"
          onCloseMobile={onCloseMobile}
        />
        <SidebarAccount isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;
