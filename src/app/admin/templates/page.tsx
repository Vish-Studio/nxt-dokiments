import type { Metadata } from "next";

import { AdminTemplatesView } from "@/components/admin/admin-templates-view/admin-templates-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin templates");

const AdminTemplatesPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Templates"
      area="admin"
      title="Templates"
    >
      <AdminTemplatesView />
    </AppShell>
  );
};

export default AdminTemplatesPage;
