import { AppShell } from "@/components/app-shell/app-shell";
import { MarketplaceBrowser } from "@/components/marketplace-browser/marketplace-browser";

const MarketplacePage = () => {
  return (
    <AppShell
      activeItem="Marketplace"
      description="Ready-to-use business documents in three styles. Preview any template, then save the ones you need."
      title="Marketplace"
    >
      <MarketplaceBrowser />
    </AppShell>
  );
};

export default MarketplacePage;
