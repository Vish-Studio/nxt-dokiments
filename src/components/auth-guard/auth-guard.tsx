"use client";

import { SpinnerGap } from "@phosphor-icons/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { useAuthStore } from "@/stores/auth-store";

export type AuthGuardProps = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      const nextPath = `${window.location.pathname}${window.location.search}`;

      window.location.replace(
        `/sign-in?next=${encodeURIComponent(nextPath)}`,
      );
    }
  }, [status]);

  if (status !== "authenticated") {
    return (
      <main className="grid min-h-dvh place-items-center bg-app-chrome text-app-chrome-content">
        <div className="grid justify-items-center gap-4">
          <SpinnerGap aria-hidden className="animate-spin text-golden-harvest" size={34} />
          <p className="font-title text-sm font-bold">Checking account access</p>
        </div>
      </main>
    );
  }

  return children;
};
