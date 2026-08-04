import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { SettingsTabs } from "@/components/dashboard/settings-tabs/settings-tabs";

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
