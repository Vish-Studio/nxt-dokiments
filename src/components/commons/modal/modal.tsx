"use client";

import { XIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { phoneMediaQuery, useMediaQuery } from "@/hooks/use-media-query";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { ModalIcon, type ModalTone } from "./modal-icon";

export interface ModalProps {
  /**
   * Footer buttons. Put the main action last: it ends up rightmost on desktop
   * and on top of the full-width stack on phones. A dismissive action
   * ("Cancel", "Done", "Not now") goes first.
   */
  actions?: ReactNode;
  /** Optional body between the header and the actions (lists, steps, menus). */
  children?: ReactNode;
  className?: string;
  /** One or two short lines under the title saying what this is about. */
  description?: ReactNode;
  /**
   * When `true` (default) Escape, a click on the backdrop and the close button
   * call `onClose`. Set `false` when the user must pick one of `actions`.
   */
  dismissible?: boolean;
  /** Replaces the tone's default glyph in the icon tile. Needs `tone`. */
  icon?: Icon;
  onClose: () => void;
  open: boolean;
  /**
   * How it appears on phones (below `sm`). Desktop is always a centred modal.
   * - `sheet` (default): anchored to the bottom, full width, for short
   *   contextual choices (next steps, menus, optional prompts).
   * - `centered`: a centred dialog, for blocking decisions (`ConfirmDialog`).
   */
  phoneLayout?: "centered" | "sheet";
  /**
   * Render into `document.body` (default). `ConfirmDialog` turns it off to stay
   * inside its caller, as it always has.
   */
  portal?: boolean;
  /** Show the close (X) button. Defaults to `dismissible`. */
  showClose?: boolean;
  title: string;
  /**
   * A small icon inline before the title ("⧩ Filters"), for menus and sheets
   * without a `tone` tile. Decorative: the title alone stays the dialog's name.
   */
  titleIcon?: Icon;
  /** Shows a tinted {@link ModalIcon} tile beside the title. Omit for plain menus. */
  tone?: ModalTone;
}

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The one modal shell for the app: a centred dialog on desktop and, on phones,
 * a bottom sheet (or a centred dialog with `phoneLayout="centered"`). Every
 * modal shares its anatomy: tone icon tile, title, description, optional body,
 * then actions. Desktop actions sit in a right-aligned row; phone actions stack
 * full width.
 *
 * Pick by job: next steps and short options use the default; blocking or
 * destructive decisions go through `ConfirmDialog` (centred everywhere); long
 * content and forms stay in `SidePanel`. The panel carries
 * `data-layout="sheet" | "centered"` and `data-tone` for tests.
 *
 * Portalled at `z-90`: above the mobile sidebar (`z-70`) and older centred
 * dialogs (`z-50`/`z-80`), so a modal opened from inside one (the upgrade prompt
 * from `ShareDialog`) is never hidden behind it, and below the `Toaster`
 * (`z-95`). Focus moves into the panel on open, Tab stays inside it, and focus
 * returns to the previously focused element on close. Entry motion is a
 * slide-up for sheets and a short rise (no fade) for centred modals, both off
 * under `prefers-reduced-motion`.
 *
 * @example
 * <Modal
 *   actions={<Button onClick={onDone}>Done</Button>}
 *   description="Your changes are saved."
 *   onClose={onClose}
 *   open={open}
 *   title="Document saved"
 *   tone="success"
 * />
 */
export const Modal = ({
  actions,
  children,
  className,
  description,
  dismissible = true,
  icon,
  onClose,
  open,
  phoneLayout = "sheet",
  portal = true,
  showClose,
  title,
  titleIcon: TitleIcon,
  tone,
}: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isPhone = useMediaQuery(phoneMediaQuery);
  const isSheet = isPhone && phoneLayout === "sheet";
  const hasClose = showClose ?? dismissible;

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

    // Keep keyboard focus inside the modal. Focus starts on the panel itself,
    // so Tab and Shift+Tab from there wrap too.
    const focusable = [
      ...panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    ];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      event.preventDefault();
      return;
    }

    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (active === last || active === panelRef.current)
    ) {
      event.preventDefault();
      first.focus();
    }
  };

  const content = (
    <div
      className={cn(
        "app-modal fixed inset-0 z-90 flex justify-center",
        isSheet ? "items-end" : "items-center p-4",
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Pointer-only: the close button or a cancel action is the accessible way out. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-nox-noir/55"
        onClick={dismissible ? onClose : undefined}
      />

      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "relative z-10 w-full overflow-y-auto border border-steel-mist bg-base-100 outline-none",
          isSheet
            ? "app-modal-sheet-enter max-h-[90dvh] rounded-t-box border-b-0 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            : "app-modal-enter max-h-[calc(100dvh-2rem)] max-w-md rounded-box p-6",
          className,
        )}
        data-layout={isSheet ? "sheet" : "centered"}
        data-tone={tone}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        {/* A plain title row (menu sheets): icon, title and close button share
            one centre line. With a tone tile or description, align to the top. */}
        <div
          className={cn(
            "flex gap-4",
            tone || description ? "items-start" : "items-center",
          )}
        >
          {tone ? (
            <ModalIcon
              icon={icon}
              tone={tone}
            />
          ) : null}
          <div className={cn("min-w-0 flex-1", tone && "pt-1")}>
            <h2
              className={cn(
                "font-title text-lg font-bold leading-7 text-nox-noir",
                TitleIcon && "flex min-w-0 items-center gap-2",
              )}
              id={titleId}
            >
              {TitleIcon ? (
                <TitleIcon
                  aria-hidden
                  className="shrink-0"
                  size={iconSize.tile}
                  weight="bold"
                />
              ) : null}
              {TitleIcon ? (
                <span className="min-w-0 truncate">{title}</span>
              ) : (
                title
              )}
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
          {hasClose ? (
            <ButtonIcon
              aria-label="Close"
              className={cn(
                "-mr-2 shrink-0",
                Boolean(tone || description) && "-mt-1",
              )}
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

        {children ? (
          <div className={cn("mt-5", tone && "sm:pl-14")}>{children}</div>
        ) : null}

        {actions ? (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );

  return portal ? createPortal(content, document.body) : content;
};

export default Modal;
