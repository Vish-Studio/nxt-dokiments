import type { Metadata } from "next";

import { AdminBannerSlideEditor } from "@/components/admin/admin-banner-slide-editor/admin-banner-slide-editor";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin marketplace slide");

type Props = { params: Promise<{ id: string }> };

const AdminBannerSlidePage = async ({ params }: Props) => {
  await requireSuperadmin();
  const { id } = await params;

  return (
    <AppShell
      activeItem="Marketplace banner"
      area="admin"
      back={{ href: "/admin/marketplace-banner", label: "Marketplace banner" }}
      title={id === "new" ? "New slide" : "Edit slide"}
    >
      {/* Keyed so opening another slide starts from that slide, not the last form. */}
      <AdminBannerSlideEditor
        key={id}
        slideId={id}
      />
    </AppShell>
  );
};

export default AdminBannerSlidePage;
