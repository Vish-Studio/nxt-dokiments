"use client";

import { useEffect } from "react";

import { Button } from "@/components/commons/button/button";

export type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export const ConfirmDialog = ({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  description,
  onClose,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) => {
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
    <div
      aria-label={title}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-nox-noir/55"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 w-full max-w-sm rounded-box border border-steel-mist bg-base-100 p-6">
        <h3 className="font-title text-lg font-bold text-nox-noir">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-nox-noir/65">{description}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={onClose} size="sm" variant="ghost">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} size="sm">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
