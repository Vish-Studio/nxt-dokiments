import { AppShell } from "@/components/app-shell/app-shell";
import { MarketplaceBrowser } from "@/components/marketplace-browser/marketplace-browser";

const MarketplacePage = () => {
  return (
    <AppShell activeItem="Marketplace" title="Marketplace">
      <MarketplaceBrowser />
    </AppShell>
  );
};

export default MarketplacePage;
