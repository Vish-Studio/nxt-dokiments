import {
  CaretLeft,
  CaretRight,
  FileText,
  House,
  Layout,
  SidebarIcon,
  Storefront,
  X,
} from "@phosphor-icons/react";

import { Button } from "@/components/button/button";
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
  { label: "Documents", href: "/dashboard", icon: FileText },
  { label: "My Templates", href: "/dashboard", icon: Layout },
  { label: "Template Marketplace", href: "/dashboard", icon: Storefront },
];

export function Sidebar({
  activeItem = "Dashboard",
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-70 shrink-0 flex-col bg-nox-noir px-5 py-7 text-white transition-all duration-300 lg:static lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "lg:w-24" : "lg:w-70",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-golden-harvest font-title text-sm font-bold text-bloodwood-deep">
            D
          </div>
          <span
            className={cn(
              "truncate font-title text-lg font-semibold transition-opacity",
              isCollapsed && "lg:sr-only lg:opacity-0",
            )}
          >
            Dokiments
          </span>
        </div>
        <Button
          aria-label={isMobileOpen ? "Close navigation" : isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="btn-circle btn-sm text-white/75 hover:bg-white/10 shadow-none border-none"
          icon={null}
          onClick={isMobileOpen ? onCloseMobile : onToggleCollapse}
          variant="ghost"
        >
          <span className="lg:hidden">
            <X aria-hidden size={16} weight="bold" />
          </span>
          <span className="hidden lg:inline-flex">
            {isCollapsed ? (
              <SidebarIcon aria-hidden size={16} weight="bold" />
            ) : (
              <SidebarIcon aria-hidden size={16} weight="bold" />
            )}
          </span>
        </Button>
      </div>

      <nav className="mt-10 grid gap-3">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === activeItem;

          return (
            <a
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex h-12 items-center gap-3 rounded-box px-3 font-title text-sm font-semibold transition-colors",
                isActive
                  ? "bg-golden-harvest text-bloodwood-deep"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
                isCollapsed && "lg:justify-center lg:px-0",
              )}
              href={item.href}
              key={item.label}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon aria-hidden className="shrink-0" size={19} weight="bold" />
              <span
                className={cn(
                  "truncate transition-opacity",
                  isCollapsed && "lg:sr-only lg:opacity-0",
                )}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
