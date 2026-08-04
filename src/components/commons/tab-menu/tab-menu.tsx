import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface TabMenuItem {
  badge?: ReactNode;
  id: string;
  icon?: ReactNode | ((isActive: boolean) => ReactNode);
  label: string;
}

export interface TabMenuProps {
  ariaLabel: string;
  className?: string;
  items: TabMenuItem[];
  onChange: (id: string) => void;
  value: string;
}

export const TabMenu = ({ ariaLabel, className, items, onChange, value }: TabMenuProps) => {
  return (
    <div className={cn("tab-menu min-w-0", className)}>
      <div
        aria-label={ariaLabel}
        className="flex gap-1 overflow-x-auto overflow-y-hidden rounded-box bg-base-200 p-1"
        role="tablist"
      >
        {items.map((item) => {
          const isActive = item.id === value;
          const icon = typeof item.icon === "function" ? item.icon(isActive) : item.icon;

          return (
            <button
              aria-selected={isActive}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-box px-3 py-2 font-title text-sm font-semibold transition-colors sm:px-4 sm:text-sm",
                isActive
                  ? "bg-nox-noir text-white"
                  : "text-nox-noir/55 hover:bg-base-100/55 hover:text-nox-noir",
              )}
              key={item.id}
              onClick={() => onChange(item.id)}
              role="tab"
              type="button"
            >
              {icon ? <span className="shrink-0">{icon}</span> : null}
              <span>{item.label}</span>
              {item.badge ? <span className="shrink-0">{item.badge}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
