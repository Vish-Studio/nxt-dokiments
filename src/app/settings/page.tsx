import { AppShell } from "@/components/app-shell/app-shell";
import { GeneralSettings } from "@/components/general-settings/general-settings";

const SettingsPage = () => {
  return (
    <AppShell
      activeItem="Settings"
      description="Manage workspace preferences and account settings."
      pageTitle="Settings"
      title="Settings"
    >
      <GeneralSettings />
    </AppShell>
  );
};

export default SettingsPage;
