import type { Metadata } from "next";

import { AdminUserDetailView } from "@/components/admin/admin-user-detail-view/admin-user-detail-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin account");

type Props = { params: Promise<{ uid: string }> };

const AdminUserDetailPage = async ({ params }: Props) => {
  await requireSuperadmin();
  const { uid } = await params;

  return (
    <AppShell
      activeItem="Users"
      area="admin"
      back={{ href: "/admin/users", label: "Users" }}
      title="Account"
    >
      <AdminUserDetailView uid={uid} />
    </AppShell>
  );
};

export default AdminUserDetailPage;
