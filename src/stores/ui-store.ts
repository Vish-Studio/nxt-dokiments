import { create } from "zustand";

type UiState = {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  /**
   * Global because two unrelated parts of the shell open the same tour: the
   * `?welcome=` flag on arrival after sign-up, and the sidebar's "Getting
   * started" row.
   */
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  isOnboardingOpen: false,
  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => set({ isOnboardingOpen: false }),
}));
