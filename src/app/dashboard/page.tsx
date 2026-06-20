import { AppShell } from "@/components/app-shell/app-shell";
import { DashboardView } from "@/components/dashboard-view/dashboard-view";

const DashboardPage = () => {
  return (
    <AppShell activeItem="Dashboard" showBanner={false}>
      <DashboardView />
    </AppShell>
  );
};

export default DashboardPage;
