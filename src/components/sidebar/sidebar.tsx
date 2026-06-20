import {
  CreditCardIcon,
  FileText,
  House,
  Layout,
  SidebarIcon,
  Storefront,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";

import { ButtonIcon } from "@/components/button-icon/button-icon";
import { SettingsNavItem } from "@/components/settings-nav-item/settings-nav-item";
import { SidebarAccount } from "@/components/sidebar-account/sidebar-account";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  href: string;
  icon: typeof House;
};

export type SidebarProps = {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  activeItem?: string;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
};

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: House },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "My Templates", href: "/my-templates", icon: Layout },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: Storefront,
  },
  { label: "Subscription", href: "/subscription", icon: CreditCardIcon },
];

export const Sidebar = ({
  activeItem = "Dashboard",
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onToggleCollapse,
}: SidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-70 shrink-0 flex-col bg-app-chrome px-5 pt-9 pb-5 text-app-chrome-content transition-all duration-300 lg:static lg:translate-x-0",
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
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-app-brand font-logo text-sm font-black text-app-brand-content transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-app-active"
            onClick={isCollapsed ? onToggleCollapse : undefined}
            type="button"
          >
            D
          </button>
          <span
            className={cn(
              "truncate font-logo text-lg font-black transition-opacity",
              isCollapsed && "lg:sr-only lg:opacity-0",
            )}
          >
            Dokiments
          </span>
        </div>
        {isCollapsed && !isMobileOpen ? null : (
          <ButtonIcon
            aria-label={isMobileOpen ? "Close navigation" : "Collapse sidebar"}
            className="border-none text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content"
            icon={
              <>
                <span className="lg:hidden">
                  <X aria-hidden size={16} weight="bold" />
                </span>
                <span className="hidden lg:inline-flex">
                  <SidebarIcon aria-hidden size={16} weight="bold" />
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
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === activeItem;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex h-10 items-center gap-3 rounded-lg px-3 font-title text-sm font-semibold transition-colors",
                isActive
                  ? "bg-app-active text-app-active-content"
                  : "text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content",
                isCollapsed && "lg:justify-center lg:px-0",
              )}
              href={item.href}
              key={item.label}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                aria-hidden
                className={cn("shrink-0", isActive && "drop-shadow-[0_0_0_currentColor]")}
                size={19}
                weight={isActive ? "fill" : "bold"}
              />
              <span
                className={cn(
                  "truncate transition-opacity",
                  isCollapsed && "lg:sr-only lg:opacity-0",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto grid gap-3 pt-8">
        <SettingsNavItem
          isActive={activeItem === "Settings"}
          isCollapsed={isCollapsed}
        />
        <SidebarAccount isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};
