import type { Metadata } from "next";

import { AdminSystemView } from "@/components/admin/admin-system-view/admin-system-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin system");

const AdminSystemPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="System"
      area="admin"
      title="System"
    >
      <AdminSystemView />
    </AppShell>
  );
};

export default AdminSystemPage;
