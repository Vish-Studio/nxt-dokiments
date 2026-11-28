import type { Metadata } from "next";

import { AdminMarketplaceBannerView } from "@/components/admin/admin-marketplace-banner-view/admin-marketplace-banner-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin marketplace banner");

const AdminMarketplaceBannerPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Marketplace banner"
      area="admin"
      title="Marketplace banner"
    >
      <AdminMarketplaceBannerView />
    </AppShell>
  );
};

export default AdminMarketplaceBannerPage;
