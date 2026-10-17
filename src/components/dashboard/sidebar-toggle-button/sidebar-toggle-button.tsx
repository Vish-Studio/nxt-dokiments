"use client";

import { ListIcon } from "@phosphor-icons/react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";

interface SidebarToggleButtonProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarToggleButton = ({
  className,
  isCollapsed,
  onToggle,
}: SidebarToggleButtonProps) => {
  return (
    <ButtonIcon
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "sidebar-toggle-button hidden size-9! min-h-9! lg:inline-flex",
        className,
      )}
      icon={
        <ListIcon
          aria-hidden
          size={15}
          weight="bold"
        />
      }
      onClick={onToggle}
      size="sm"
      variant="ghost"
    />
  );
};
