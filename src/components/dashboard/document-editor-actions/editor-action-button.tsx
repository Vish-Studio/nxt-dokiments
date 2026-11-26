"use client";

import type { Icon } from "@phosphor-icons/react";

import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface EditorActionButtonProps {
  className?: string;
  icon: Icon;
  /** The action's name. Always the button's accessible name. */
  label: string;
  onClick: () => void;
}

/**
 * One icon action in {@link DocumentEditorActions}'s dark bar.
 *
 * On desktop (`lg`) only the icon shows until hover or keyboard focus, when
 * the label slides out to its right. The label is always in the accessible
 * name, so screen readers hear it either way.
 */
export const EditorActionButton = ({
  className,
  icon: ActionIcon,
  label,
  onClick,
}: EditorActionButtonProps) => (
  <button
    className={cn(
      "editor-action-button group flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full px-2.5 font-title text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-harvest",
      "text-app-chrome-content hover:bg-white/10 hover:text-white",
      className,
    )}
    onClick={onClick}
    type="button"
  >
    <ActionIcon
      aria-hidden
      className="shrink-0"
      size={iconSize.tile}
      weight="bold"
    />
    <span
      className={cn(
        "overflow-hidden whitespace-nowrap transition-all duration-200 lg:max-w-0 lg:opacity-0 lg:group-hover:ml-2 lg:group-hover:max-w-32 lg:group-hover:opacity-100 lg:group-focus-visible:ml-2 lg:group-focus-visible:max-w-32 lg:group-focus-visible:opacity-100 motion-reduce:transition-none",
        "max-w-0 opacity-0",
      )}
    >
      {label}
    </span>
  </button>
);

export default EditorActionButton;
