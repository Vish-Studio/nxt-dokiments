import { Confidence } from "@/components/website/confidence/confidence";
import { ConversionCta } from "@/components/website/conversion-cta/conversion-cta";
import { Faq } from "@/components/website/faq/faq";
import { FeatureTabs } from "@/components/website/feature-tabs/feature-tabs";
import { Footer } from "@/components/website/footer/footer";
import { Header } from "@/components/website/header/header";
import { Hero } from "@/components/website/hero/hero";
import { MarketplaceShowcase } from "@/components/website/marketplace-showcase/marketplace-showcase";
import { NewsletterModal } from "@/components/website/newsletter-modal/newsletter-modal";
import { StyleSwitcher } from "@/components/website/style-switcher/style-switcher";
import { TemplateStrip } from "@/components/website/template-strip/template-strip";
import { Testimonials } from "@/components/website/testimonials/testimonials";
import { UseCases } from "@/components/website/use-cases/use-cases";
import { Workflow } from "@/components/website/workflow/workflow";

export const Landing = () => {
  return (
    <main className="min-h-screen bg-white text-nox-noir">
      <Header />
      <Hero />
      <FeatureTabs />
      <StyleSwitcher />
      <MarketplaceShowcase />
      <UseCases />
      <TemplateStrip />
      <ConversionCta
        description="Your saved templates, account role, and document drafts live behind sign-in, so you can pick up exactly where you left off."
        placement="mid"
        title="Already know which template you need? Sign in and keep moving."
      />
      <Testimonials />
      <Workflow />
      <Confidence />
      <ConversionCta
        description="Start with your existing account or create one in seconds. Either path takes you to the same focused document workspace."
        eyebrow="Final step"
        placement="final"
        title="Get into Dokiments and create the document."
      />
      <Faq />
      <Footer />
      <NewsletterModal />
    </main>
  );
};
