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
  /**
   * Phones (below `sm`): inactive tabs show only their icon and share the
   * width equally; the active tab adds its label to the right of its icon. Every tab stays visible instead of scrolling off the edge, and each
   * keeps its full label as its accessible name. From `sm` the menu looks as
   * usual. Needs an icon on every item.
   */
  fitOnPhones?: boolean;
  items: TabMenuItem[];
  onChange: (id: string) => void;
  value: string;
}

export const TabMenu = ({ ariaLabel, className, fitOnPhones = false, items, onChange, value }: TabMenuProps) => {
  return (
    <div className={cn("tab-menu min-w-0", className)}>
      <div
        aria-label={ariaLabel}
        className={cn(
          "flex gap-1 overflow-x-auto overflow-y-hidden rounded-tab bg-base-200 p-1",
          fitOnPhones && "max-sm:overflow-x-visible",
        )}
        role="tablist"
      >
        {items.map((item) => {
          const isActive = item.id === value;
          const icon = typeof item.icon === "function" ? item.icon(isActive) : item.icon;

          return (
            <button
              // Phones hide inactive labels; assistive tech still hears them.
              aria-label={fitOnPhones ? item.label : undefined}
              aria-selected={isActive}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 font-title text-sm font-semibold transition-colors sm:px-4 sm:text-sm",
                fitOnPhones &&
                  (isActive
                    ? "max-sm:min-w-0 max-sm:justify-center max-sm:px-4"
                    : "max-sm:min-w-0 max-sm:flex-1 max-sm:justify-center max-sm:px-0"),
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
              {fitOnPhones ? (
                <span className={cn("inline-flex min-w-0 items-center gap-2", !isActive && "max-sm:hidden")}>
                  <span className="truncate">{item.label}</span>
                  {item.badge ? <span className="shrink-0">{item.badge}</span> : null}
                </span>
              ) : (
                <>
                  <span>{item.label}</span>
                  {item.badge ? <span className="shrink-0">{item.badge}</span> : null}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
