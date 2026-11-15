import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { AuthLayout } from "@/components/commons/auth-layout/auth-layout";
import { InviteLanding } from "@/components/commons/invite-landing/invite-landing";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Document invitation");

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

/**
 * Public landing page for an emailed invite link (`/shared/<token>`). It is
 * outside the protected prefixes on purpose: the visitor may not have an
 * account yet. Answers `404` while the `documentSharing` flag is off.
 */
const InvitePage = async ({ params }: InvitePageProps) => {
  if (!documentSharingEnabled) {
    notFound();
  }

  const { token } = await params;

  return (
    <AuthLayout
      description="Someone shared a document with you for your signature."
      title="You have a document to sign"
    >
      <InviteLanding token={token} />
    </AuthLayout>
  );
};

export default InvitePage;
