import { Moon, Sun } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export type ThemeToggleProps = {
  isCollapsed?: boolean;
};

export function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-box bg-white/5 p-2",
        isCollapsed && "lg:justify-center lg:bg-transparent lg:p-0",
      )}
    >
      <div
        className={cn(
          "flex h-10 flex-1 items-center rounded-box bg-white/5 p-1",
          isCollapsed && "lg:hidden",
        )}
      >
        <button
          aria-pressed="true"
          className="flex flex-1 items-center justify-center gap-2 rounded-box bg-golden-harvest px-2 py-2 font-title text-xs font-bold text-bloodwood-deep"
          type="button"
        >
          <Sun aria-hidden size={15} weight="bold" />
          Light
        </button>
        <button
          aria-pressed="false"
          className="flex flex-1 items-center justify-center gap-2 rounded-box px-2 py-2 font-title text-xs font-bold text-white/70"
          type="button"
        >
          <Moon aria-hidden size={15} weight="bold" />
          Dark
        </button>
      </div>
      <button
        aria-label="Toggle theme"
        className={cn(
          "hidden size-12 items-center justify-center rounded-box bg-white/5 text-white/75 hover:bg-white/10",
          isCollapsed && "lg:flex",
        )}
        type="button"
      >
        <Sun aria-hidden size={19} weight="bold" />
      </button>
    </div>
  );
}
