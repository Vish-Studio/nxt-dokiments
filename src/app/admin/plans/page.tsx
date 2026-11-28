import type { Metadata } from "next";

import { AdminPlansView } from "@/components/admin/admin-plans-view/admin-plans-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin plans");

const AdminPlansPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Plans"
      area="admin"
      title="Plans"
    >
      <AdminPlansView />
    </AppShell>
  );
};

export default AdminPlansPage;
