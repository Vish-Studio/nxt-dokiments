"use client";

import { create } from "zustand";

import type { AuthSession, AuthUser } from "@/types/auth";

const AUTH_STORAGE_KEY = "dokiments-auth-session";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  clearSession: () => void;
  getStoredSession: () => AuthSession | null;
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  status: AuthStatus;
  user: AuthUser | null;
};

const readStoredSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const writeStoredSession = (session: AuthSession | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const useAuthStore = create<AuthState>((set) => ({
  clearSession: () => {
    writeStoredSession(null);
    set({ session: null, status: "unauthenticated", user: null });
  },
  getStoredSession: readStoredSession,
  session: null,
  setSession: (session) => {
    writeStoredSession(session);
    set({
      session,
      status: session ? "authenticated" : "unauthenticated",
      user: session?.user ?? null,
    });
  },
  status: "loading",
  user: null,
}));
