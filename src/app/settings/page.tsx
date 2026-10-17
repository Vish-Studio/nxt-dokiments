import type { Metadata } from "next";

import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { SettingsTabs } from "@/components/dashboard/settings-tabs/settings-tabs";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Settings");

const SettingsPage = () => {
  return (
    <AppShell
      activeItem="Settings"
      description="Manage your account and preferences."
      title="Settings"
    >
      <SettingsTabs />
    </AppShell>
  );
};

export default SettingsPage;
