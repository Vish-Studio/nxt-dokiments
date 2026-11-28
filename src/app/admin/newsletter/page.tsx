import type { Metadata } from "next";

import { AdminNewsletterView } from "@/components/admin/admin-newsletter-view/admin-newsletter-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin newsletter");

const AdminNewsletterPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Newsletter"
      area="admin"
      title="Newsletter"
    >
      <AdminNewsletterView />
    </AppShell>
  );
};

export default AdminNewsletterPage;
