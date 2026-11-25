"use client";

import { ToastItem } from "@/components/commons/toast-item/toast-item";
import { useToastStore } from "@/stores/toast-store";

/**
 * Bottom-centred stack of the toasts in `toast-store`. Mounted once in `AppShell`
 * (and in Storybook's preview), so a component only calls `showToast`. At
 * `z-95`, the top layer: above dialogs (`z-80`) and bottom sheets (`z-90`), and
 * moved to the top of the screen while a sheet is open (see `globals.css`).
 */
export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div
      aria-live="polite"
      className="toaster pointer-events-none fixed inset-x-0 bottom-0 z-95 flex flex-col items-center gap-2 px-4 pb-4 sm:pb-6"
    >
      {toasts.map((toast) => (
        <div
          className="w-full max-w-sm"
          key={toast.id}
        >
          <ToastItem
            onDismiss={dismissToast}
            toast={toast}
          />
        </div>
      ))}
    </div>
  );
};

export default Toaster;
