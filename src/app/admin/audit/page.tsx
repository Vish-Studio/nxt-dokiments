import type { Metadata } from "next";

import { AdminAuditView } from "@/components/admin/admin-audit-view/admin-audit-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin audit log");

const AdminAuditPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Audit log"
      area="admin"
      title="Audit log"
    >
      <AdminAuditView />
    </AppShell>
  );
};

export default AdminAuditPage;
