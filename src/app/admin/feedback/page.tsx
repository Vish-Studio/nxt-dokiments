import type { Metadata } from "next";

import { AdminFeedbackView } from "@/components/admin/admin-feedback-view/admin-feedback-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { requireSuperadmin } from "@/lib/admin/require-superadmin";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Admin feedback");

const AdminFeedbackPage = async () => {
  await requireSuperadmin();

  return (
    <AppShell
      activeItem="Feedback"
      area="admin"
      title="Feedback"
    >
      <AdminFeedbackView />
    </AppShell>
  );
};

export default AdminFeedbackPage;
