"use client";

import { XIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  /**
   * Footer buttons. Put the main action last: on phones the buttons stack full
   * width with the last one on top, and from `sm` up they form a right-aligned
   * row with the last one rightmost. A dismissive action ("Done", "Not now")
   * goes first.
   */
  actions?: ReactNode;
  /** Optional body between the header and the actions. */
  children?: ReactNode;
  className?: string;
  /** One or two short lines under the title. */
  description?: ReactNode;
  /**
   * When `true` (default) Escape, a tap on the backdrop and the close button
   * call `onClose`. Set `false` only when the user must pick one of `actions`.
   */
  dismissible?: boolean;
  /** Small leading visual beside the title, e.g. a success check. */
  icon?: ReactNode;
  /** Called when a dismissible sheet is dismissed. */
  onClose: () => void;
  open: boolean;
  title: string;
}

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A modal sheet anchored to the bottom of the screen: full width on phones and
 * a centred `max-w-lg` panel from `sm` up. Use it for short, contextual choices,
 * such as next steps after an action or a handful of options, where a centred
 * dialog would feel heavier than the moment needs. Blocking decisions
 * ("Delete document?") stay in `ConfirmDialog`; long content stays in
 * `SidePanel`.
 *
 * Renders in a portal on `document.body` at `z-90`: above the mobile sidebar
 * (`z-70`) and every centred dialog (`z-50`/`z-80`), so a sheet opened from
 * inside a dialog (e.g. the upgrade prompt from `ShareDialog`) is never hidden
 * behind it, and below the `Toaster` (`z-95`). Focus moves into the sheet on
 * open, Tab stays inside it, and focus returns to the previously focused
 * element on close. The slide-up animation is disabled under
 * `prefers-reduced-motion`.
 *
 * @example
 * <BottomSheet
 *   actions={<Button onClick={onDone}>Done</Button>}
 *   description="Your changes are saved."
 *   onClose={onClose}
 *   open={open}
 *   title="Document saved"
 * />
 */
export const BottomSheet = ({
  actions,
  children,
  className,
  description,
  dismissible = true,
  icon,
  onClose,
  open,
  title,
}: BottomSheetProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && dismissible) {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !panelRef.current) {
      return;
    }

    // Keep keyboard focus inside the sheet while it is open.
    const focusable = [
      ...panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    ];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      event.preventDefault();
      return;
    }

    // Focus starts on the panel itself, so Tab and Shift+Tab from there must
    // wrap inside the sheet too, not escape to the page behind.
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        document.activeElement === panelRef.current)
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last ||
        document.activeElement === panelRef.current)
    ) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="bottom-sheet fixed inset-0 z-90 flex items-end justify-center sm:px-4"
      onKeyDown={handleKeyDown}
    >
      {dismissible ? (
        // Mouse/touch only: the close button inside the sheet is the
        // accessible way out, so this second "Close" stays hidden from
        // assistive tech.
        <button
          aria-hidden
          className="absolute inset-0 bg-nox-noir/55"
          onClick={onClose}
          tabIndex={-1}
          type="button"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-nox-noir/55"
        />
      )}

      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "bottom-sheet-enter relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-box border border-b-0 border-steel-mist bg-base-100 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] outline-none",
          className,
        )}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start gap-3">
          {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
          <div className="min-w-0 flex-1">
            <h2
              className="font-title text-lg font-bold text-nox-noir"
              id={titleId}
            >
              {title}
            </h2>
            {description ? (
              <div
                className="mt-1 text-sm leading-6 text-nox-noir/65"
                id={descriptionId}
              >
                {description}
              </div>
            ) : null}
          </div>
          {dismissible ? (
            <ButtonIcon
              aria-label="Close"
              className="-mt-1 -mr-2 shrink-0"
              icon={
                <XIcon
                  aria-hidden
                  size={iconSize.control}
                  weight="bold"
                />
              }
              onClick={onClose}
              variant="ghost"
            />
          ) : null}
        </div>

        {children ? <div className="mt-5">{children}</div> : null}

        {actions ? (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

export default BottomSheet;
