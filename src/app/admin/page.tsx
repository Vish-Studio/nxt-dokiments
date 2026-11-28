import type { Metadata } from "next";

import { AdminOverviewView } from "@/components/admin/admin-overview-view/admin-overview-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin overview");

const AdminOverviewPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Overview"
      area="admin"
      title="Overview"
    >
      <AdminOverviewView />
    </AppShell>
  );
};

export default AdminOverviewPage;
