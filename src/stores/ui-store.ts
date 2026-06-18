import { create } from "zustand";

export type AppPalette = "classic" | "golden" | "bloodwood";

type UiState = {
  appPalette: AppPalette;
  isSidebarCollapsed: boolean;
  setAppPalette: (palette: AppPalette) => void;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  appPalette: "classic",
  isSidebarCollapsed: false,
  setAppPalette: (palette) => set({ appPalette: palette }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
