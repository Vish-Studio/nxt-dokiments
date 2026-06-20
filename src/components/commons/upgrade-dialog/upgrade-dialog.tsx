"use client";

import { CrownIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/commons/button/button";

export type UpgradeDialogProps = {
  description?: string;
  onClose: () => void;
  open: boolean;
  title?: string;
};

export const UpgradeDialog = ({
  description = "You've reached the 2-template limit on the free plan. Upgrade your account to save more templates.",
  onClose,
  open,
  title = "Upgrade to add more templates",
}: UpgradeDialogProps) => {
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

      <div className="relative z-10 w-full max-w-sm rounded-box border border-steel-mist bg-base-100 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-golden-harvest text-nox-noir">
          <CrownIcon aria-hidden size={24} weight="bold" />
        </div>
        <h3 className="mt-4 font-title text-lg font-bold text-nox-noir">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-nox-noir/60">{description}</p>

        <div className="mt-6 grid gap-2">
          <Link
            className="btn btn-primary font-title font-semibold tracking-normal"
            href="/subscription"
            onClick={onClose}
          >
            View plans
          </Link>
          <Button onClick={onClose} size="sm" variant="ghost">
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
};
