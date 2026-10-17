import type { Metadata } from "next";

import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view/dashboard-view";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Dashboard");

const DashboardPage = () => {
  return (
    <AppShell activeItem="Dashboard" showBanner={false}>
      <DashboardView />
    </AppShell>
  );
};

export default DashboardPage;
