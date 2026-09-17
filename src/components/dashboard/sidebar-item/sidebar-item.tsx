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

/**
 * The shared look of a sidebar row.
 *
 * Exported because not every row is a link: `SidebarFeedback` opens a dialog and
 * so has to be a `<button>`, but must be indistinguishable from its neighbours.
 * Keeping the classes here means the two cannot drift apart.
 */
export const sidebarRowClassName = ({
  className,
  isActive = false,
  isCollapsed = false,
}: {
  className?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}) =>
  cn(
    "sidebar-item group flex h-10 items-center gap-3 rounded-lg px-3 font-title text-sm font-semibold transition-colors",
    isActive
      ? "bg-white text-app-active-content"
      : "text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content",
    isCollapsed && "lg:justify-center lg:px-0",
    className,
  );

/**
 * The label of a sidebar row, hidden to a screen-reader-only element when the
 * sidebar is collapsed on desktop. Shared with `SidebarFeedback` for the same
 * reason as {@link sidebarRowClassName}.
 */
export const sidebarRowLabelClassName = (isCollapsed: boolean) =>
  cn("truncate transition-opacity", isCollapsed && "lg:sr-only lg:opacity-0");

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
      className={sidebarRowClassName({ className, isActive, isCollapsed })}
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
      <span className={sidebarRowLabelClassName(isCollapsed)}>{label}</span>
    </Link>
  );
};

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
