"use client";

import { SidebarSimpleIcon } from "@phosphor-icons/react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";

interface SidebarToggleButtonProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Desktop-only sidebar collapse control. It lives in the sidebar itself, next
 * to the logo (never in the top bar), styled like the sidebar's nav items.
 */
export const SidebarToggleButton = ({
  className,
  isCollapsed,
  onToggle,
}: SidebarToggleButtonProps) => {
  return (
    <ButtonIcon
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "sidebar-toggle-button hidden size-9! min-h-9! border-none bg-transparent text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content lg:inline-flex",
        className,
      )}
      icon={
        <SidebarSimpleIcon
          aria-hidden
          size={18}
          weight="bold"
        />
      }
      onClick={onToggle}
      size="sm"
      variant="ghost"
    />
  );
};
