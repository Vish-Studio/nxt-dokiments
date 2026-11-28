import type { Metadata } from "next";

import { AdminNotificationsView } from "@/components/admin/admin-notifications-view/admin-notifications-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin notifications");

const AdminNotificationsPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Notifications"
      area="admin"
      title="Notifications"
    >
      <AdminNotificationsView />
    </AppShell>
  );
};

export default AdminNotificationsPage;
