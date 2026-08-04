import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import type { FunctionComponent } from "react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  href: string;
  icon: Icon;
  isActive?: boolean;
  isCollapsed?: boolean;
  label: string;
  onCloseMobile?: () => void;
}

const SidebarItem: FunctionComponent<Props> = ({
  className,
  href,
  icon: Icon,
  isActive = false,
  isCollapsed = false,
  label,
  onCloseMobile,
}) => {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "sidebar-item group flex h-10 items-center gap-3 rounded-lg px-3 font-title text-sm font-semibold transition-colors",
        isActive
          ? "bg-white text-app-active-content"
          : "text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content",
        isCollapsed && "lg:justify-center lg:px-0",
        className,
      )}
      href={href}
      onClick={onCloseMobile}
      title={isCollapsed ? label : undefined}
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
        {label}
      </span>
    </Link>
  );
};

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
