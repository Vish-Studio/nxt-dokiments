import { create } from "zustand";

type AppUpdateState = {
  accept: (() => void) | null;
  /** A new build is installed and waiting, whether or not its banner was dismissed. */
  isWaiting: boolean;
  /** When this page view first learned of the update, for the notification's timestamp. */
  waitingSince: number | null;
  setUpdate: (update: { accept: () => void; isWaiting: boolean }) => void;
};

/** Bridges `useAppUpdate` (mounted once, in `BottomNotices`) to the notification center. */
export const useAppUpdateStore = create<AppUpdateState>((set) => ({
  accept: null,
  isWaiting: false,
  waitingSince: null,
  setUpdate: ({ accept, isWaiting }) =>
    set((state) => ({
      accept,
      isWaiting,
      waitingSince: isWaiting ? (state.waitingSince ?? Date.now()) : null,
    })),
}));
