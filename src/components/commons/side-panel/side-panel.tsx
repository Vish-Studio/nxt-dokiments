"use client";

import { XIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";

export type SidePanelTone =
  | "blue"
  | "golden"
  | "mist"
  | "noir"
  | "pink"
  | "purple"
  | "teal";

type ToneStyle = {
  closeButton: string;
  description: string;
  header: string;
  title: string;
};

const toneStyles: Record<SidePanelTone, ToneStyle> = {
  blue: {
    closeButton: "border-nox-noir/15 text-nox-noir hover:bg-nox-noir/10",
    description: "text-nox-noir/70",
    header: "border-nox-noir/15 bg-play-blue",
    title: "text-nox-noir",
  },
  golden: {
    closeButton: "border-nox-noir/15 text-nox-noir hover:bg-nox-noir/10",
    description: "text-nox-noir/70",
    header: "border-nox-noir/15 bg-golden-harvest",
    title: "text-nox-noir",
  },
  mist: {
    closeButton: "border-nox-noir/15 text-nox-noir hover:bg-nox-noir/10",
    description: "text-nox-noir/70",
    header: "border-nox-noir/15 bg-steel-mist",
    title: "text-nox-noir",
  },
  noir: {
    closeButton: "border-white/20 text-white hover:bg-white/10",
    description: "text-white/70",
    header: "border-white/15 bg-nox-noir",
    title: "text-white",
  },
  pink: {
    closeButton: "border-nox-noir/15 text-nox-noir hover:bg-nox-noir/10",
    description: "text-nox-noir/70",
    header: "border-nox-noir/15 bg-play-pink",
    title: "text-nox-noir",
  },
  purple: {
    closeButton: "border-nox-noir/15 text-nox-noir hover:bg-nox-noir/10",
    description: "text-nox-noir/70",
    header: "border-nox-noir/15 bg-play-purple",
    title: "text-nox-noir",
  },
  teal: {
    closeButton: "border-nox-noir/15 text-nox-noir hover:bg-nox-noir/10",
    description: "text-nox-noir/70",
    header: "border-nox-noir/15 bg-play-teal",
    title: "text-nox-noir",
  },
};

export type SidePanelProps = {
  ariaLabel?: string;
  children: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  tone?: SidePanelTone;
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
  tone = "golden",
  title,
}: SidePanelProps) => {
  const style = toneStyles[tone];
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

      <div className="side-panel-enter absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-base-100">
        <header className={cn("flex justify-between gap-4 border-b p-5 sm:p-6", description ? 'items-start' : 'items-center', style.header)}>
          <div className="min-w-0">
            {title ? (
              <h3 className={cn("truncate font-title text-xl font-bold leading-tight sm:text-2xl", style.title)}>{title}</h3>
            ) : null}
            {description ? <p className={cn("mt-2 text-sm leading-5", style.description)}>{description}</p> : null}
          </div>
          <ButtonIcon
            aria-label="Close panel"
            className={cn("border", style.closeButton)}
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
