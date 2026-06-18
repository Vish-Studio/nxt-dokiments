import { create } from "zustand";

type DashboardLayoutState = {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export const useDashboardLayoutStore = create<DashboardLayoutState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
