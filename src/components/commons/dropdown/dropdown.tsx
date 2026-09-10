"use client";

import { CheckIcon } from "@phosphor-icons/react";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/commons/button/button";
import type { SelectOption } from "@/components/commons/select/select";
import { cn } from "@/lib/utils";

export interface DropdownGroup {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export interface DropdownProps {
  ariaLabel: string;
  children?: ReactNode;
  trigger: ReactNode;
  groups?: DropdownGroup[];
  closeOnSelect?: boolean;
  align?: "start" | "end";
  buttonClassName?: string;
  className?: string;
  menuClassName?: string;
}

export const Dropdown = ({
  align = "end", ariaLabel, buttonClassName, children, className,
  closeOnSelect = true, groups, menuClassName, trigger,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const hasMenu = Boolean(groups);
  const initialFocus = useRef<"first" | "last">("first");

  useEffect(() => {
    if (!isOpen) return;
    if (hasMenu) {
      const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]:not(:disabled)');
      const target = initialFocus.current === "last" ? items?.[items.length - 1] : items?.[0];
      target?.focus();
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, hasMenu]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!groups) return;
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]:not(:disabled)') ?? []);
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === "ArrowDown") next = (current + 1) % items.length;
    else if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    items[next]?.focus();
  };

  return (
    <div className={cn("dropdown", align === "end" ? "dropdown-end" : "dropdown-start", isOpen && "dropdown-open", className)} ref={dropdownRef}>
      <Button
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        aria-haspopup={groups ? "menu" : undefined}
        aria-label={ariaLabel}
        className={buttonClassName}
        onClick={() => { initialFocus.current = "first"; setIsOpen((current) => !current); }}
        onKeyDown={(event) => {
          if (groups && ["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            initialFocus.current = event.key === "ArrowUp" ? "last" : "first";
            setIsOpen(true);
          }
        }}
        ref={triggerRef}
        size="sm"
        variant="ghost"
      >{trigger}</Button>
      {isOpen ? (
        <div
          aria-label={ariaLabel}
          className={cn("dropdown-content z-50 mt-2 max-h-80 overflow-y-auto rounded-box border border-steel-mist bg-base-100 p-2 text-nox-noir shadow-sm", menuClassName)}
          id={menuId}
          onKeyDown={handleMenuKeyDown}
          ref={menuRef}
          role={groups ? "menu" : undefined}
        >
          {groups?.map((group) => (
            <div aria-label={group.label} className="border-t border-steel-mist/50 py-1 first:border-0" key={group.label} role="group">
              <p className="px-3 py-2 font-title text-xs font-semibold text-nox-noir/50">{group.label}</p>
              {group.options.map((option) => (
                <Button
                  aria-checked={group.value === option.value}
                  className={cn("w-full justify-start gap-3 rounded-field border-0 px-3 text-left font-medium! focus-visible:bg-base-200 focus-visible:outline-none", group.value === option.value && "bg-base-200")}
                  disabled={option.disabled}
                  key={option.value}
                  onClick={() => {
                    group.onChange(option.value);
                    if (closeOnSelect) { setIsOpen(false); triggerRef.current?.focus(); }
                  }}
                  role="menuitemradio"
                  tabIndex={-1}
                  size="sm"
                  variant="ghost"
                >
                  <span className="flex-1">{option.label}</span>
                  <CheckIcon aria-hidden className={group.value === option.value ? "opacity-100" : "opacity-0"} size={16} weight="bold" />
                </Button>
              ))}
            </div>
          ))}
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default Dropdown;
