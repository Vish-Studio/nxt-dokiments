"use client";

import Image from "next/image";
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
 * a loading screen while `AuthProvider` hydrates the session from
 * `GET /api/auth/me`. Once `status` leaves `"loading"`, the page content is
 * rendered.
 *
 * The loading screen mirrors `AppShell` — dark chrome around the white panel —
 * so the hand-over to the real page is a fill-in rather than a jump.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const status = useAuthStore((state) => state.status);

  if (status === "loading") {
    return (
      <main className="auth-guard flex min-h-dvh bg-app-chrome lg:p-4">
        <div
          aria-busy="true"
          aria-live="polite"
          className="grid flex-1 place-items-center bg-app-panel px-6 text-center lg:rounded-4xl"
          role="status"
        >
          <div className="grid justify-items-center">
            <div className="grid size-20 place-items-center rounded-box bg-golden-harvest">
              <Image
                alt=""
                className="size-10"
                draggable={false}
                height={40}
                preload
                src="/images/svg/icon-black.svg"
                width={40}
              />
            </div>

            <div
              aria-hidden
              className="relative mt-8 h-1 w-32 overflow-hidden rounded-full bg-nox-noir/10"
            >
              <span className="auth-guard-progress absolute inset-y-0 left-0 w-1/3 rounded-full bg-nox-noir" />
            </div>

            <h1 className="mt-6 font-title text-lg font-bold text-nox-noir">
              Checking your account
            </h1>
            <p className="mt-1 text-sm text-nox-noir/60">
              This only takes a moment.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return children;
};
