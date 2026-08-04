"use client";

import { SpinnerGapIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

import type { ButtonProps } from "@/components/commons/button/button";
import { Button } from "@/components/commons/button/button";

export type ConfirmDialogProps = {
  cancelLabel?: string | null;
  confirmLabel?: string;
  confirmLoading?: boolean;
  confirmVariant?: ButtonProps["variant"];
  description?: string;
  dismissible?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export const ConfirmDialog = ({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  confirmLoading = false,
  confirmVariant = "primary",
  description,
  dismissible = true,
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

    if (dismissible) {
      document.addEventListener("keydown", handleKeyDown);
    }
    document.body.style.overflow = "hidden";

    return () => {
      if (dismissible) {
        document.removeEventListener("keydown", handleKeyDown);
      }
      document.body.style.overflow = "";
    };
  }, [dismissible, open, onClose]);

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
      {dismissible ? (
        <button
          aria-label="Close"
          className="absolute inset-0 bg-nox-noir/55"
          onClick={onClose}
          type="button"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-nox-noir/55"
        />
      )}

      <div className="relative z-10 w-full max-w-sm rounded-box border border-steel-mist bg-base-100 p-6">
        <h3 className="font-title text-lg font-bold text-nox-noir">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-nox-noir/65">
            {description}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          {cancelLabel ? (
            <Button
              disabled={confirmLoading}
              onClick={onClose}
              size="sm"
              variant="ghost"
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            disabled={confirmLoading}
            icon={
              confirmLoading ? (
                <SpinnerGapIcon
                  aria-hidden
                  className="animate-spin"
                  size={16}
                  weight="bold"
                />
              ) : null
            }
            iconPosition="left"
            onClick={onConfirm}
            size="sm"
            variant={confirmVariant}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
