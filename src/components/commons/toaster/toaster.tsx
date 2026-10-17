"use client";

import { ToastItem } from "@/components/commons/toast-item/toast-item";
import { useToastStore } from "@/stores/toast-store";

/**
 * Bottom-centred stack of the toasts in `toast-store`. Mounted once in `AppShell`
 * (and in Storybook's preview), so a component only calls `showToast`.
 */
export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div
      aria-live="polite"
      className="toaster pointer-events-none fixed inset-x-0 bottom-0 z-80 flex flex-col items-center gap-2 px-4 pb-4 sm:pb-6"
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
