"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { useAuthStore } from "@/stores/auth-store";

export type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Root session hydration provider. Mount once in the root layout.
 *
 * On mount, calls `GET /api/auth/me` to read the HttpOnly session cookie
 * server-side and return the authenticated user. This is the only place where
 * the client learns about the current session — no tokens are ever exposed
 * to the browser.
 *
 * The `active` flag prevents a stale `setUser` call if the component unmounts
 * before the fetch resolves (e.g. during fast navigation in development).
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) {
          if (active) setUser(null);
          return;
        }
        const { user } = await res.json();
        if (active) setUser(user);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, [setUser]);

  return children;
};
