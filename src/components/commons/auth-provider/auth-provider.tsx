"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useSessionQuery } from "@/hooks/queries/use-session";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useAuthStore } from "@/stores/auth-store";

export type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Root session hydration provider. Mount once in the root layout.
 *
 * Reads the session via `useSessionQuery` (backed by `GET /api/auth/me`) and
 * mirrors its result into `useAuthStore`, so no tokens are ever exposed to the
 * browser — the store only ever holds the public `AuthUser` object.
 *
 * Also the single mount point for `useSessionTimeout`, which signs the user out
 * when the session reaches its 1-day cap.
 *
 * This mirroring is a deliberate transitional step: `useAuthStore` still exists
 * because most components read session state from it directly rather than
 * calling `useSessionQuery` themselves. As those call sites migrate, this sync
 * effect (and eventually `auth-store.ts` itself) can be removed.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: user, isLoading } = useSessionQuery();
  const setUser = useAuthStore((state) => state.setUser);

  useSessionTimeout();

  useEffect(() => {
    if (!isLoading) {
      setUser(user ?? null);
    }
  }, [isLoading, user, setUser]);

  return children;
};
