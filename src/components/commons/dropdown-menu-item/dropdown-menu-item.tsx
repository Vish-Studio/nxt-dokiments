import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Button } from "@/components/commons/button/button";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface DropdownMenuItemProps {
  /** The action's label. Also its accessible name. */
  children: ReactNode;
  /** Greys the item out. Arrow keys skip a disabled item. */
  disabled?: boolean;
  /** Decorative Phosphor icon before the label, at `iconSize.control`. */
  icon?: Icon;
  onClick: () => void;
  /** `danger` is red, for destructive actions such as Delete. Default `default`. */
  tone?: "danger" | "default";
}

/**
 * One action in a `Dropdown` action menu (the `children` variant): an icon and a
 * label, red for destructive actions.
 *
 * It renders `role="menuitem"` with `tabIndex={-1}`, which is what lets the
 * `Dropdown` focus it on open and move between items with the arrow keys, Home
 * and End, while Tab leaves the menu. Every actionable child of an action menu
 * must be one of these: a plain button inside `role="menu"` is invisible to
 * the keyboard model and breaks the menu for screen readers.
 *
 * @example
 * <Dropdown ariaLabel="More actions for Acme" sheetTitle="Acme">
 *   <DropdownMenuItem icon={PencilSimpleIcon} onClick={edit}>Edit client</DropdownMenuItem>
 *   <DropdownMenuItem icon={TrashIcon} onClick={askToDelete} tone="danger">Delete</DropdownMenuItem>
 * </Dropdown>
 */
export const DropdownMenuItem = ({
  children,
  disabled,
  icon: ItemIcon,
  onClick,
  tone = "default",
}: DropdownMenuItemProps) => (
  <Button
    className={cn(
      "dropdown-menu-item w-full justify-start gap-2 px-3 whitespace-nowrap focus-visible:bg-base-200 focus-visible:outline-none",
      tone === "danger" &&
        "text-error hover:bg-error/10 focus-visible:bg-error/10",
    )}
    disabled={disabled}
    icon={
      ItemIcon ? (
        <ItemIcon
          aria-hidden
          size={iconSize.control}
          weight="bold"
        />
      ) : undefined
    }
    iconPosition="left"
    onClick={onClick}
    role="menuitem"
    size="sm"
    tabIndex={-1}
    variant="ghost"
  >
    {children}
  </Button>
);

export default DropdownMenuItem;
