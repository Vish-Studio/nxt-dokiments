"use client";

import { useEffect } from "react";

import { OnboardingDialog } from "@/components/dashboard/onboarding-dialog/onboarding-dialog";
import {
  hasOnboardingFlag,
  withoutOnboarding,
} from "@/lib/onboarding/onboarding";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";

/**
 * Owns the one `OnboardingDialog` in the app, bound to `ui-store` so the sidebar's
 * "Getting started" row can open it too.
 *
 * Mounted once by `AppShell`, like `PromoStatusBanner`, so the tour opens on
 * whichever protected page a new user lands on (`next` can point anywhere, though
 * it is `/dashboard` by default).
 *
 * Reads `window.location.search` in a deferred effect rather than through
 * `useSearchParams`, matching `PromoStatusBanner`. The flag is then dropped from
 * the address bar, so a refresh, the back button or a copied link does not
 * replay the tour.
 */
export const OnboardingLauncher = () => {
  const isOpen = useUiStore((state) => state.isOnboardingOpen);
  const openOnboarding = useUiStore((state) => state.openOnboarding);
  const closeOnboarding = useUiStore((state) => state.closeOnboarding);
  const userName = useAuthStore((state) => state.user?.displayName);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!hasOnboardingFlag(window.location.search)) return;

      window.history.replaceState(
        window.history.state,
        "",
        withoutOnboarding(window.location.href),
      );
      openOnboarding();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [openOnboarding]);

  return (
    <OnboardingDialog
      onClose={closeOnboarding}
      open={isOpen}
      userName={userName}
    />
  );
};
