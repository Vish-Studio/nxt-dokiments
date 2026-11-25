import { create } from "zustand";

/**
 * Where the top bar's back arrow goes on a sub-page: a link (`href`) or an
 * in-page step back (`onClick`, e.g. the editor returning to the list).
 * `label` names the destination for assistive tech ("Back to {label}").
 */
export type PageBack = {
  href?: string;
  label: string;
  onClick?: () => void;
};

/** What a page's content asks the top bar to show instead of its defaults. */
export type PageHeaderOverride = {
  back?: PageBack;
  /** Replaces the route's title, e.g. the company name on a company page. */
  title?: string;
};

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
  /**
   * Epoch ms until which the header refresh button stays disabled. Global so the
   * cooldown survives page navigation and is shared by the desktop and mobile
   * buttons. `Infinity` means a refresh is in flight.
   */
  refreshCooldownUntil: number;
  setRefreshCooldownUntil: (until: number) => void;
  /**
   * Set by sub-page content through `usePageHeader` so the top bar shows a back
   * arrow and the right title. Global because the content (e.g. the document
   * editor inside `/my-documents`) and the `AppShell` header are siblings.
   */
  pageHeader: PageHeaderOverride | null;
  setPageHeader: (header: PageHeaderOverride | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  isOnboardingOpen: false,
  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => set({ isOnboardingOpen: false }),
  refreshCooldownUntil: 0,
  setRefreshCooldownUntil: (until) => set({ refreshCooldownUntil: until }),
  pageHeader: null,
  setPageHeader: (header) => set({ pageHeader: header }),
}));
