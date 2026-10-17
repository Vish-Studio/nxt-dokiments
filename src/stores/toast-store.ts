import { create } from "zustand";

export type ToastTone = "error" | "success";

export type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastState = {
  clearToasts: () => void;
  dismissToast: (id: number) => void;
  showToast: (toast: Omit<Toast, "id">) => void;
  toasts: Toast[];
};

/** How long a toast stays up before it dismisses itself. */
export const toastDuration = 4000;

let nextToastId = 0;

/**
 * The confirmations the shared `Toaster` shows along the bottom of the screen.
 * Anything can call `showToast` after a save — the `Toaster` mounted once in the
 * app shell owns the timing and the markup. Only the newest few are kept so a
 * burst of saves can't stack up the screen.
 */
export const useToastStore = create<ToastState>((set) => ({
  clearToasts: () => set({ toasts: [] }),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  showToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: ++nextToastId }].slice(-3),
    })),
  toasts: [],
}));
