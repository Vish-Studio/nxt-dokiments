"use client";

import { XIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { ButtonIcon } from "@/components/button-icon/button-icon";

export type SidePanelProps = {
  ariaLabel?: string;
  children: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  title?: ReactNode;
};

/** A flat drawer that slides in from the right edge of the screen. */
export const SidePanel = ({
  ariaLabel,
  children,
  description,
  footer,
  onClose,
  open,
  title,
}: SidePanelProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div aria-label={ariaLabel} aria-modal="true" className="fixed inset-0 z-50" role="dialog">
      <button
        aria-label="Close panel"
        className="absolute inset-0 bg-nox-noir/55"
        onClick={onClose}
        type="button"
      />

      <div className="side-panel-enter absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-steel-mist bg-base-100">
        <header className="flex items-start justify-between gap-4 border-b border-steel-mist p-4">
          <div className="min-w-0">
            {title ? (
              <h3 className="truncate font-title text-base font-bold text-nox-noir">{title}</h3>
            ) : null}
            {description ? <p className="text-xs text-nox-noir/55">{description}</p> : null}
          </div>
          <ButtonIcon
            aria-label="Close panel"
            icon={<XIcon aria-hidden size={18} weight="bold" />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-steel-mist p-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
};
