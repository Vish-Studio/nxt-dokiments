"use client";

import {
  CheckCircleIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { type Toast, toastDuration } from "@/stores/toast-store";

export interface ToastItemProps {
  onDismiss: (id: number) => void;
  toast: Toast;
}

/** One toast: a noir bar with a tone icon, dismissing itself after `toastDuration`. */
export const ToastItem = ({ onDismiss, toast }: ToastItemProps) => {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toastDuration);

    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  const Icon = toast.tone === "success" ? CheckCircleIcon : WarningCircleIcon;

  return (
    <div
      className="toast-item toast-item-enter pointer-events-auto flex w-full items-center gap-3 rounded-box bg-nox-noir py-2 pr-2 pl-4 text-sm font-medium text-white shadow-sm"
      role={toast.tone === "error" ? "alert" : "status"}
    >
      <Icon
        aria-hidden
        className={cn(
          "shrink-0",
          toast.tone === "success" ? "text-success" : "text-error",
        )}
        size={20}
        weight="fill"
      />
      <p className="min-w-0 flex-1 py-1.5">{toast.message}</p>
      <button
        aria-label="Dismiss notification"
        className="flex size-8 shrink-0 items-center justify-center rounded-field text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        onClick={() => onDismiss(toast.id)}
        type="button"
      >
        <XIcon aria-hidden size={16} weight="bold" />
      </button>
    </div>
  );
};

export default ToastItem;
