import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminSharingDetailView } from "@/components/admin/admin-sharing-detail-view/admin-sharing-detail-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { getSampleShare } from "@/lib/admin/sharing/dummy-data";
import { privatePageMetadata } from "@/lib/seo/site";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";

export const metadata: Metadata = privatePageMetadata("Admin shared document");

type Props = { params: Promise<{ id: string }> };

const AdminSharingDetailPage = async ({ params }: Props) => {
  await requireSuperadmin();

  if (!documentSharingEnabled) notFound();

  const { id } = await params;
  // Sample data for now; becomes a Firestore read once superadmins may read shares.
  const share = getSampleShare(id);

  if (!share) notFound();

  return (
    <AppShell
      activeItem="Sharing"
      area="admin"
      back={{ href: "/admin/sharing", label: "Sharing" }}
      title={share.name}
    >
      <AdminSharingDetailView share={share} />
    </AppShell>
  );
};

export default AdminSharingDetailPage;
