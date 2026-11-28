import type { Metadata } from "next";

import { AdminPromotionsView } from "@/components/admin/admin-promotions-view/admin-promotions-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin promotions");

const AdminPromotionsPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Promotions"
      area="admin"
      title="Promotions"
    >
      <AdminPromotionsView />
    </AppShell>
  );
};

export default AdminPromotionsPage;
