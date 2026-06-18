import { GearSix } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export type SettingsNavItemProps = {
  isActive?: boolean;
  isCollapsed?: boolean;
};

export const SettingsNavItem = ({
  isActive = false,
  isCollapsed = false,
}: SettingsNavItemProps) => {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex h-12 items-center gap-3 rounded-box px-3 font-title text-sm font-semibold transition-colors",
        isActive
          ? "bg-app-active text-app-active-content"
          : "text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content",
        isCollapsed && "lg:justify-center lg:px-0",
      )}
      href="/settings"
      title={isCollapsed ? "Settings" : undefined}
    >
      <GearSix aria-hidden className="shrink-0" size={19} weight="bold" />
      <span
        className={cn(
          "truncate transition-opacity",
          isCollapsed && "lg:sr-only lg:opacity-0",
        )}
      >
        Settings
      </span>
    </a>
  );
};
