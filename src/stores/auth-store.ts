"use client";

import { create } from "zustand";

import type { AuthUser } from "@/types/auth";

/** Lifecycle state of the client-side auth session. */
type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/**
 * Client-side auth state managed by Zustand.
 *
 * This store holds only the public user profile — Firebase tokens are kept
 * server-side in an HttpOnly cookie and are never exposed to the browser.
 */
type AuthState = {
  /**
   * Clears the in-memory user state and sets status to `"unauthenticated"`.
   * Called after a successful sign-out API call so the UI updates immediately
   * without waiting for a page navigation.
   */
  clearSession: () => void;
  /**
   * Sets the authenticated user and transitions status to `"authenticated"`,
   * or clears the user and transitions to `"unauthenticated"` when `null`.
   * Called by `AuthProvider` after `GET /api/auth/me` resolves, and by auth
   * forms after a successful sign-in or sign-up.
   */
  setUser: (user: AuthUser | null) => void;
  /**
   * Current auth lifecycle state.
   * Starts as `"loading"` until `AuthProvider` resolves the session on mount.
   */
  status: AuthStatus;
  /** Authenticated user profile, or `null` when unauthenticated or loading. */
  user: AuthUser | null;
};

/** Global auth store. Consume via the `useAuthStore` hook in client components. */
export const useAuthStore = create<AuthState>((set) => ({
  clearSession: () => set({ status: "unauthenticated", user: null }),
  setUser: (user) => set({ status: user ? "authenticated" : "unauthenticated", user }),
  status: "loading",
  user: null,
}));
