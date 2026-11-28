import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminSharingView } from "@/components/admin/admin-sharing-view/admin-sharing-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";

export const metadata: Metadata = privatePageMetadata("Admin sharing");

const AdminSharingPage = async () => {
  await requireSuperadmin();

  // Sharing is off on this deployment, so there is nothing to look after.
  if (!documentSharingEnabled) notFound();

  return (
    <AppShell
      activeItem="Sharing"
      area="admin"
      title="Sharing"
    >
      <AdminSharingView />
    </AppShell>
  );
};

export default AdminSharingPage;
