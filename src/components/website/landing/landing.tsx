import { Footer } from "@/components/website/footer/footer";
import { Header } from "@/components/website/header/header";
import { Hero } from "@/components/website/hero/hero";
import { MarketplaceShowcase } from "@/components/website/marketplace-showcase/marketplace-showcase";
import { Overview } from "@/components/website/overview/overview";
import { Pricing } from "@/components/website/pricing/pricing";
import { Workflow } from "@/components/website/workflow/workflow";

export const Landing = () => {
  return (
    <main className="min-h-screen bg-white text-nox-noir">
      <Header />
      <Hero />
      <Overview />
      <MarketplaceShowcase />
      <Pricing />
      <Workflow />
      <Footer />
    </main>
  );
};
