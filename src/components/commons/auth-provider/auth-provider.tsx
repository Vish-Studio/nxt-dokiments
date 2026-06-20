"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { devAuthSession, isDevAuthBypassEnabled } from "@/lib/dev-auth";
import { refreshFirebaseSession } from "@/lib/firebase/rest-auth";
import { useAuthStore } from "@/stores/auth-store";

const REFRESH_SKEW_MS = 60_000;

export type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const clearSession = useAuthStore((state) => state.clearSession);
  const getStoredSession = useAuthStore((state) => state.getStoredSession);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      if (isDevAuthBypassEnabled) {
        setSession(devAuthSession);
        return;
      }

      const storedSession = getStoredSession();

      if (!storedSession) {
        setSession(null);
        return;
      }

      if (storedSession.expiresAt > Date.now() + REFRESH_SKEW_MS) {
        setSession(storedSession);
        return;
      }

      try {
        const refreshedSession = await refreshFirebaseSession(storedSession);

        if (isMounted) {
          setSession(refreshedSession);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      }
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession, getStoredSession, setSession]);

  return children;
};
