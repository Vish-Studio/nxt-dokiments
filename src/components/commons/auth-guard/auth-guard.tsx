"use client";

import { SpinnerGap } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { useAuthStore } from "@/stores/auth-store";

export type AuthGuardProps = {
  children: ReactNode;
};

/**
 * Client-side loading gate for protected routes.
 *
 * Hard redirects for unauthenticated users are handled server-side by
 * `proxy.ts` before React renders, so this component's only job is to render
 * a spinner while `AuthProvider` hydrates the session from `GET /api/auth/me`.
 * Once `status` leaves `"loading"`, the page content is rendered.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const status = useAuthStore((state) => state.status);

  if (status === "loading") {
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
