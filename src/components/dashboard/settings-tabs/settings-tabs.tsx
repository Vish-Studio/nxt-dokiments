"use client";

import { LockKeyIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { ReactNode } from "react";

import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { PasswordSettings } from "@/components/dashboard/password-settings/password-settings";
import { ProfileSettings } from "@/components/dashboard/profile-settings/profile-settings";

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
  const activePanel = tabs.find((tab) => tab.id === activeTab)?.panel;

  return (
    <section className="w-full">
      <TabMenu
        ariaLabel="Settings sections"
        items={tabs.map((tab) => {
          const Icon = tab.icon;

          return {
            icon: (isActive: boolean) => (
              <Icon aria-hidden size={18} weight={isActive ? "bold" : "regular"} />
            ),
            id: tab.id,
            label: tab.label,
          };
        })}
        onChange={(tabId) => setActiveTab(tabId as SettingsTabId)}
        value={activeTab}
      />

      <div className="mt-8" role="tabpanel">
        {activePanel}
      </div>
    </section>
  );
};
