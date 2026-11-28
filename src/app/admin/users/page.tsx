import type { Metadata } from "next";

import { AdminUsersView } from "@/components/admin/admin-users-view/admin-users-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin users");

const AdminUsersPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Users"
      area="admin"
      title="Users"
    >
      <AdminUsersView />
    </AppShell>
  );
};

export default AdminUsersPage;
