import type { Metadata } from "next";

import { AdminDocumentsView } from "@/components/admin/admin-documents-view/admin-documents-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin documents");

const AdminDocumentsPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Documents"
      area="admin"
      title="Documents"
    >
      <AdminDocumentsView />
    </AppShell>
  );
};

export default AdminDocumentsPage;
