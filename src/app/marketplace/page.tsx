import type { Metadata } from "next";

import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { MarketplaceBrowser } from "@/components/dashboard/marketplace-browser/marketplace-browser";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Marketplace");

const MarketplacePage = () => {
  return (
    <AppShell
      activeItem="Marketplace"
      description="Ready-to-use business documents in different styles that will fit your brand. Preview any template, then save the ones you need."
      title="Marketplace"
    >
      <MarketplaceBrowser />
    </AppShell>
  );
};

export default MarketplacePage;
