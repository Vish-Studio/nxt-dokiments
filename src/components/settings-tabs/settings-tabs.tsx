"use client";

import { LockKeyIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { ReactNode } from "react";

import { PasswordSettings } from "@/components/password-settings/password-settings";
import { ProfileSettings } from "@/components/profile-settings/profile-settings";
import { cn } from "@/lib/utils";

type SettingsTabId = "profile" | "password";

type SettingsTab = {
  icon: typeof UserCircleIcon;
  id: SettingsTabId;
  label: string;
  panel: ReactNode;
};

const tabs: SettingsTab[] = [
  { icon: UserCircleIcon, id: "profile", label: "Profile", panel: <ProfileSettings /> },
  { icon: LockKeyIcon, id: "password", label: "Password", panel: <PasswordSettings /> },
];

export type SettingsTabsProps = {
  defaultTab?: SettingsTabId;
};

export const SettingsTabs = ({ defaultTab = "profile" }: SettingsTabsProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(defaultTab);

  return (
    <section className="w-full">
      <div
        aria-label="Settings sections"
        className="flex flex-wrap gap-6 border-b border-steel-mist"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              aria-selected={isActive}
              className={cn(
                "-mb-px inline-flex items-center gap-2 border-b-2 px-1 pb-3 font-title text-sm font-semibold transition-colors",
                isActive
                  ? "border-nox-noir text-nox-noir"
                  : "border-transparent text-nox-noir/50 hover:text-nox-noir",
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              <Icon aria-hidden size={18} weight={isActive ? "bold" : "regular"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8" role="tabpanel">
        {tabs.find((tab) => tab.id === activeTab)?.panel}
      </div>
    </section>
  );
};
