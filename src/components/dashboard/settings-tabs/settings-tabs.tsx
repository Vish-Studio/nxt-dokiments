"use client";

import {
  CrownSimpleIcon,
  GiftIcon,
  LockKeyIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

import { PasswordSettings } from "@/components/dashboard/password-settings/password-settings";
import { PlanAccessCard } from "@/components/dashboard/plan-access-card/plan-access-card";
import { ProfileSettings } from "@/components/dashboard/profile-settings/profile-settings";
import { PromoCodeCard } from "@/components/dashboard/promo-code-card/promo-code-card";
import {
  type SettingsNavItem,
  SettingsNav,
} from "@/components/dashboard/settings-nav/settings-nav";
import { signOutAndRedirect } from "@/lib/auth/sign-out";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types/auth";

type SettingsTabId = "plan" | "profile" | "promotions" | "security";

type SettingsSection = SettingsNavItem & {
  description: string;
  id: SettingsTabId;
  /** A render function where the panel needs the signed-in user. */
  panel: ReactNode | ((user: AuthUser | null) => ReactNode);
};

const sections: SettingsSection[] = [
  {
    description: "Your account and the details added to your documents.",
    icon: UserCircleIcon,
    id: "profile",
    label: "My profile",
    panel: <ProfileSettings />,
  },
  {
    description: "Your current plan and the features it unlocks.",
    icon: CrownSimpleIcon,
    id: "plan",
    label: "Plan",
    panel: (user) => <PlanAccessCard role={user?.role ?? "free"} />,
  },
  {
    description: "How you sign in to Dokiments.",
    icon: LockKeyIcon,
    id: "security",
    label: "Security",
    panel: <PasswordSettings />,
  },
  {
    description: "Offers and promo codes on your account.",
    icon: GiftIcon,
    id: "promotions",
    label: "Promotions",
    panel: <PromoCodeCard />,
  },
];

export type SettingsTabsProps = {
  defaultTab?: SettingsTabId;
};

/**
 * The Settings page body: one bordered surface with the section menu down the
 * left (a tab bar on mobile) and the active section on the right — its title,
 * then its cards.
 */
export const SettingsTabs = ({ defaultTab = "profile" }: SettingsTabsProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(defaultTab);
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);
  const active = sections.find((section) => section.id === activeTab) ?? sections[0];

  return (
    // Desktop: fills the rest of the content area down to the shell's bottom
    // padding, and only the active section scrolls. Mobile flows as one page.
    <section className="settings-tabs w-full pt-6 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      {/* `grid-cols-1` + `min-w-0`: the mobile tab bar scrolls sideways inside its
          own row instead of stretching the page wider than the screen.
          `lg:min-h-96` stops a very short window squashing the surface; the
          content area scrolls instead. */}
      <div className="grid grid-cols-1 gap-6 lg:min-h-96 lg:flex-1 lg:grid-cols-12 lg:gap-0 lg:overflow-hidden lg:rounded-box lg:border lg:border-steel-mist lg:bg-base-100">
        <div className="min-w-0 lg:col-span-3 lg:flex lg:flex-col lg:p-4">
          <SettingsNav
            items={sections}
            onChange={(id) => setActiveTab(id as SettingsTabId)}
            onSignOut={() => void signOutAndRedirect(queryClient, clearSession)}
            value={activeTab}
          />
          <p className="hidden px-4 pt-4 pb-2 text-xs text-nox-noir/45 lg:block">
            Dokiments v{process.env.APP_VERSION}
          </p>
        </div>

        <div
          aria-label={active.label}
          // Light grey behind the white cards, so they stand off the page.
          className="min-w-0 lg:col-span-9 lg:overflow-y-auto lg:border-l lg:border-steel-mist lg:bg-base-200 lg:p-8"
          role="tabpanel"
        >
          <div className="mb-6">
            <h2 className="font-title text-2xl font-bold tracking-tight text-nox-noir">
              {active.label}
            </h2>
            <p className="mt-1 text-sm leading-6 text-nox-noir/60">
              {active.description}
            </p>
          </div>
          {typeof active.panel === "function" ? active.panel(user) : active.panel}
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-nox-noir/45 lg:hidden">
        Dokiments v{process.env.APP_VERSION}
      </p>
    </section>
  );
};
