import { SidebarSimpleIcon, XIcon } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import SidebarAccount from "@/components/dashboard/sidebar-account/sidebar-account";
import SidebarFeedback from "@/components/dashboard/sidebar-feedback/sidebar-feedback";
import SidebarItem from "@/components/dashboard/sidebar-item/sidebar-item";
import SidebarOnboarding from "@/components/dashboard/sidebar-onboarding/sidebar-onboarding";
import { SidebarToggleButton } from "@/components/dashboard/sidebar-toggle-button/sidebar-toggle-button";
import { isSuperadmin } from "@/lib/admin/access";
import {
  adminNavigationItem,
  adminNavigationSections,
  openAppNavigationItem,
  sidebarItems,
  settingsNavigationItem,
} from "@/lib/dashboard-navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import Image from "next/image";
import Link from "next/link";

/**
 * Which navigation the sidebar shows.
 * - `admin`: the admin portal's grouped sections, with "Open app" at the foot.
 * - `app`: the product, plus "Admin portal" above Settings for a superadmin.
 */
export type SidebarArea = "admin" | "app";

interface Props {
  activeItem?: string;
  /** Defaults to `app`. */
  area?: SidebarArea;
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}


const Sidebar: FunctionComponent<Props> = ({
  activeItem = "Dashboard",
  area = "app",
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onToggleCollapse,
}) => {
  // Only decides whether the row is shown; every /admin page and route checks
  // the role on the server.
  const canOpenAdmin = isSuperadmin(useAuthStore((state) => state.user));

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
              "group/expand relative size-9 shrink-0 items-center justify-center rounded-field text-app-nav transition-colors hover:bg-app-nav-hover hover:text-app-chrome-content",
              isCollapsed ? "hidden lg:flex" : "hidden",
            )}
            onClick={isCollapsed ? onToggleCollapse : undefined}
            type="button"
          >
            {/* The logo mark, swapped for the sidebar icon on hover so the
                way to expand is obvious. */}
            <Image
              alt="Dokiments icon"
              className="size-8 group-hover/expand:hidden"
              height={100}
              src={"/images/svg/icon-white.svg"}
              width={100}
            />
            <SidebarSimpleIcon
              aria-hidden
              className="hidden group-hover/expand:block"
              size={18}
              weight="bold"
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
            {/* The wordmark is 16880×2544 (≈6.6:1). Its real ratio must be
                given here: a square 120×120 box reserved a 120px-tall gap until
                the SVG loaded, pushing the nav down (layout shift on reload). */}
            <Image
              alt="Dokiments logo"
              className="mb-1 h-[18px] w-[120px]"
              height={18}
              priority
              src={"/images/svg/logo-white.svg"}
              width={120}
            />
          </Link>
        </div>
        {!isCollapsed && onToggleCollapse ? (
          <SidebarToggleButton
            isCollapsed={false}
            onToggle={onToggleCollapse}
          />
        ) : null}
        {isMobileOpen ? (
          <ButtonIcon
            aria-label="Close navigation"
            className="border-none lg:hidden text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content"
            icon={<XIcon aria-hidden size={16} weight="bold" />}
            onClick={onCloseMobile}
            size="sm"
            variant="ghost"
          />
        ) : null}
      </div>

      {area === "admin" ? (
        <nav
          aria-label="Admin portal"
          className="sidebar-scroll -mx-1 mt-10 grid min-h-0 content-start gap-5 overflow-y-auto px-1"
        >
          {adminNavigationSections.map((section) => (
            <div
              className={cn(
                "grid gap-1",
                // Collapsed, the group labels are hidden, so a hairline and
                // extra space are what tell one group from the next.
                section.label && isCollapsed && "lg:border-t lg:border-white/15 lg:pt-4",
              )}
              key={section.label ?? "top"}
            >
              {section.label ? (
                <p
                  className={cn(
                    "px-3 pb-1 font-title text-xs font-bold uppercase text-app-nav",
                    isCollapsed && "lg:sr-only",
                  )}
                >
                  {section.label}
                </p>
              ) : null}
              {section.items.map((item) => (
                <SidebarItem
                  {...item}
                  isActive={item.label === activeItem}
                  isCollapsed={isCollapsed}
                  key={item.label}
                  onCloseMobile={onCloseMobile}
                />
              ))}
            </div>
          ))}
        </nav>
      ) : (
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
      )}

      {area === "admin" ? (
        <div className="mt-auto grid gap-3 pt-6">
          <SidebarItem
            {...openAppNavigationItem}
            className="bg-app-control"
            isCollapsed={isCollapsed}
            onCloseMobile={onCloseMobile}
          />
          <SidebarAccount isCollapsed={isCollapsed} />
        </div>
      ) : (
        <div className="mt-auto grid gap-3 pt-8">
          <SidebarOnboarding
            isCollapsed={isCollapsed}
            onCloseMobile={onCloseMobile}
          />
          <SidebarFeedback
            isCollapsed={isCollapsed}
            onCloseMobile={onCloseMobile}
          />
          {canOpenAdmin ? (
            <SidebarItem
              {...adminNavigationItem}
              isCollapsed={isCollapsed}
              onCloseMobile={onCloseMobile}
            />
          ) : null}
          <SidebarItem
            {...settingsNavigationItem}
            isActive={activeItem === "Settings"}
            isCollapsed={isCollapsed}
            onCloseMobile={onCloseMobile}
          />
          <SidebarAccount isCollapsed={isCollapsed} />
        </div>
      )}
    </aside>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;
