import { AppShell } from "@/components/app-shell/app-shell";
import { SettingsTabs } from "@/components/settings-tabs/settings-tabs";

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
