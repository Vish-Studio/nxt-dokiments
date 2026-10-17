"use client";

import type { Icon } from "@phosphor-icons/react";
import { SignOutIcon } from "@phosphor-icons/react";

import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { cn } from "@/lib/utils";

export interface SettingsNavItem {
  icon: Icon;
  id: string;
  label: string;
}

export interface SettingsNavProps {
  items: SettingsNavItem[];
  onChange: (id: string) => void;
  onSignOut: () => void;
  value: string;
}

/**
 * The Settings section menu.
 *
 * From `lg` up it is a vertical list down the left of the Settings surface, with
 * "Log out" set apart in red at the bottom. Below `lg` it becomes the shared
 * horizontal `TabMenu`, and Log out stays in the sidebar where it already is.
 * Only one of the two is ever displayed, so assistive tech sees one tab list.
 */
export const SettingsNav = ({
  items,
  onChange,
  onSignOut,
  value,
}: SettingsNavProps) => (
  <nav
    aria-label="Settings"
    // Fills the menu column on desktop so Log out can sit at its foot.
    className="settings-nav lg:flex lg:flex-1 lg:flex-col"
  >
    <TabMenu
      ariaLabel="Settings sections"
      className="lg:hidden"
      items={items.map((item) => ({
        icon: (isActive: boolean) => (
          <item.icon
            aria-hidden
            size={18}
            weight={isActive ? "bold" : "regular"}
          />
        ),
        id: item.id,
        label: item.label,
      }))}
      onChange={onChange}
      value={value}
    />

    <div className="hidden flex-1 flex-col lg:flex">
      <div
        aria-label="Settings sections"
        aria-orientation="vertical"
        className="grid gap-1"
        role="tablist"
      >
        {items.map((item) => {
          const isActive = item.id === value;

          return (
            <button
              aria-selected={isActive}
              className={cn(
                "flex h-11 items-center gap-3 rounded-field px-4 text-left font-title text-sm font-semibold transition-colors",
                isActive
                  ? "bg-nox-noir text-white"
                  : "text-nox-noir/60 hover:bg-base-200 hover:text-nox-noir",
              )}
              key={item.id}
              onClick={() => onChange(item.id)}
              role="tab"
              type="button"
            >
              <item.icon
                aria-hidden
                className="shrink-0"
                size={18}
                weight={isActive ? "bold" : "regular"}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      <button
        className="mt-auto flex h-11 items-center gap-3 rounded-field px-4 text-left font-title text-sm font-semibold text-error transition-colors hover:bg-error/10"
        onClick={onSignOut}
        type="button"
      >
        <SignOutIcon
          aria-hidden
          className="shrink-0"
          size={18}
          weight="bold"
        />
        Log out
      </button>
    </div>
  </nav>
);

export default SettingsNav;
