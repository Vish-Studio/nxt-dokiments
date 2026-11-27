"use client";

import { useMediaQuery } from "@altalyst/hookify";
import { CheckIcon, type Icon } from "@phosphor-icons/react";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import { Modal } from "@/components/commons/modal/modal";
import { Button } from "@/components/commons/button/button";
import { ButtonIcon, type ButtonIconShape } from "@/components/commons/button-icon/button-icon";
import type { SelectOption } from "@/components/commons/select/select";
import { phoneMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * The shared trigger treatment for every application dropdown. It matches the
 * collection toolbar's sort and filter controls while allowing each caller to
 * add its own responsive sizing or width.
 */
export const dropdownControlClassName =
  "gap-2 whitespace-nowrap rounded-field border border-steel-mist/70 bg-base-200 text-nox-noir hover:border-steel-mist hover:bg-base-200 aria-expanded:bg-base-200";

type DropdownOption = SelectOption & {
  /** Secondary text shown below the option label. */
  description?: string;
};

/**
 * Every item the keyboard can reach in an open menu: the `groups` radios and
 * the `DropdownMenuItem`s of an action menu. Disabled items are skipped.
 */
const menuItemSelector =
  '[role="menuitem"]:not(:disabled), [role="menuitemradio"]:not(:disabled)';

export interface DropdownGroup {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

export interface DropdownProps {
  ariaLabel: string;
  /**
   * Custom popup content. By default it is an action menu (`role="menu"`) whose
   * actionable children must be `DropdownMenuItem`s, so the arrow keys work.
   * Content that isn't a list of actions sets `popupRole="dialog"`.
   */
  children?: ReactNode;
  /**
   * What a `children` popup is, for assistive technology and the keyboard.
   * Ignored with `groups`, which is always a menu.
   * - `menu` (default): an action menu. The trigger opens it with Enter,
   *   Space or ArrowDown (ArrowUp focuses the last item), focus moves to the
   *   first item, arrows, Home and End move between items, Escape and
   *   Shift+Tab close it on the trigger, and Tab leaves it.
   * - `dialog`: a panel with its own controls, such as the notification feed.
   *   Opening leaves focus on the trigger and Tab walks the panel.
   */
  popupRole?: "dialog" | "menu";
  trigger?: ReactNode;
  iconTrigger?: ReactNode;
  /** Shape of the `iconTrigger` button. Defaults to `circle`. */
  iconTriggerShape?: ButtonIconShape;
  groups?: DropdownGroup[];
  closeOnSelect?: boolean;
  /** Disables the trigger, so the menu can't open. Keeps the control in place (no layout shift). */
  disabled?: boolean;
  align?: "start" | "end";
  buttonClassName?: string;
  className?: string;
  /** Popover classes (width, position). Not applied in the phone sheet. */
  menuClassName?: string;
  /**
   * Opt in to a bottom-sheet {@link Modal} on phones (below `sm`): the open menu
   * renders in a sheet titled with this text instead of the anchored popover,
   * so actions and filters get thumb-friendly targets. Desktop keeps the
   * popover. Leave it unset for pickers that belong to a form field.
   */
  sheetTitle?: string;
  /** Icon shown before `sheetTitle` in the phone sheet ("⧩ Filters"). */
  sheetIcon?: Icon;
  /**
   * An extra button shown before "Done" in the phone sheet of a multi-select
   * menu (`closeOnSelect={false}`), such as "Clear filters". Disabled rather
   * than hidden when there is nothing to do, so the footer doesn't jump.
   */
  sheetSecondaryAction?: { disabled?: boolean; label: string; onClick: () => void };
}

export const Dropdown = ({
  align = "end", ariaLabel, buttonClassName, children, className,
  closeOnSelect = true, disabled = false, groups, iconTrigger, iconTriggerShape = "circle", menuClassName, popupRole = "menu", sheetIcon, sheetSecondaryAction, sheetTitle, trigger,
}: DropdownProps) => {
  const isPhone = useMediaQuery(phoneMediaQuery);
  const isSheet = Boolean(sheetTitle) && isPhone;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  // A `children` popup is a menu unless the caller says it is a dialog.
  const hasMenu = Boolean(groups) || (Boolean(children) && popupRole === "menu");
  const haspopup = groups ? "menu" : children ? popupRole : undefined;
  const initialFocus = useRef<"first" | "last">("first");

  useEffect(() => {
    if (!isOpen) return;
    if (hasMenu) {
      const items = menuRef.current?.querySelectorAll<HTMLButtonElement>(menuItemSelector);
      const target = initialFocus.current === "last" ? items?.[items.length - 1] : items?.[0];
      target?.focus();
    }
    // The sheet owns its backdrop, Escape and focus return.
    if (isSheet) return;
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
  }, [isOpen, hasMenu, isSheet]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!hasMenu) return;
    // Shift+Tab would land on the trigger with the menu still open; close it
    // there, as Escape does. Tab needs nothing: the items are `tabIndex={-1}`,
    // so focus leaves the dropdown and the focus-out listener closes it.
    if (!groups && event.key === "Tab" && event.shiftKey && !isSheet) {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>(menuItemSelector) ?? []);
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

  const toggleMenu = () => {
    initialFocus.current = "first";
    setIsOpen((current) => !current);
  };

  const openWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (hasMenu && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      initialFocus.current = event.key === "ArrowUp" ? "last" : "first";
      setIsOpen(true);
    }
  };

  // One menu body, shown in the anchored popover or, on phones, in the sheet,
  // where every menu item grows to a 44px touch target (a dialog body such as
  // the notification feed keeps its own sizes). The `!` is needed: the
  // unlayered `.btn.btn-sm` rule in globals.css outranks layered utilities.
  const menu = (
    <div
      aria-label={ariaLabel}
      className={isSheet ? cn("-mx-2", hasMenu && "[&_button]:h-11! [&_button]:min-h-11!") : cn("dropdown-content z-50 mt-2 max-h-80 overflow-y-auto rounded-box border border-steel-mist bg-base-100 p-2 text-nox-noir shadow-sm", menuClassName)}
      id={menuId}
      // Custom popups (children) close once one of their buttons or links
      // is used; a link would otherwise leave the sheet open over the next page.
      onClick={(event) => {
        if (!groups && closeOnSelect && (event.target as Element).closest("button, a[href]")) setIsOpen(false);
      }}
      onKeyDown={handleMenuKeyDown}
      ref={menuRef}
      // In the sheet the Modal is already the dialog, so a dialog body needs no role.
      role={hasMenu ? "menu" : isSheet ? undefined : popupRole}
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
              <span className="min-w-0 flex-1">
                <span className="block truncate">{option.label}</span>
                {option.description ? (
                  <span className="block truncate text-xs font-normal text-nox-noir/55">
                    {option.description}
                  </span>
                ) : null}
              </span>
              <CheckIcon aria-hidden className={group.value === option.value ? "opacity-100" : "opacity-0"} size={16} weight="bold" />
            </Button>
          ))}
        </div>
      ))}
      {children}
    </div>
  );

  return (
    <div className={cn("dropdown", align === "end" ? "dropdown-end" : "dropdown-start", isOpen && "dropdown-open", className)} ref={dropdownRef}>
      {iconTrigger ? (
        <ButtonIcon
          aria-controls={isOpen ? menuId : undefined}
          aria-expanded={isOpen}
          aria-haspopup={haspopup}
          aria-label={ariaLabel}
          className={buttonClassName}
          disabled={disabled}
          icon={iconTrigger}
          onClick={toggleMenu}
          onKeyDown={openWithKeyboard}
          ref={triggerRef}
          shape={iconTriggerShape}
          size="sm"
          variant="ghost"
        />
      ) : (
        <Button
          aria-controls={isOpen ? menuId : undefined}
          aria-expanded={isOpen}
          aria-haspopup={haspopup}
          aria-label={ariaLabel}
          className={cn(dropdownControlClassName, buttonClassName)}
          disabled={disabled}
          onClick={toggleMenu}
          onKeyDown={openWithKeyboard}
          ref={triggerRef}
          size="sm"
          variant="ghost"
        >
          {trigger}
        </Button>
      )}
      {isOpen && !isSheet ? menu : null}
      {sheetTitle ? (
        <Modal
          actions={
            isSheet && !closeOnSelect ? (
              sheetSecondaryAction ? (
                <div className="grid w-full grid-cols-2 gap-2">
                  <Button
                    className="w-full"
                    disabled={sheetSecondaryAction.disabled}
                    onClick={sheetSecondaryAction.onClick}
                    size="sm"
                    variant="outline"
                  >
                    {sheetSecondaryAction.label}
                  </Button>
                  <Button className="w-full" onClick={() => setIsOpen(false)} size="sm">Done</Button>
                </div>
              ) : (
                <Button onClick={() => setIsOpen(false)} size="sm">Done</Button>
              )
            ) : undefined
          }
          onClose={() => setIsOpen(false)}
          open={isOpen && isSheet}
          title={sheetTitle}
          titleIcon={sheetIcon}
        >
          {menu}
        </Modal>
      ) : null}
    </div>
  );
};

export default Dropdown;
