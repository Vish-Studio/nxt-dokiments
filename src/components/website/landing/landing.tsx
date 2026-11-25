import { ClientsShowcase } from "@/components/website/clients-showcase/clients-showcase";
import { Confidence } from "@/components/website/confidence/confidence";
import { ConversionCta } from "@/components/website/conversion-cta/conversion-cta";
import { ConversionCtaDocuments } from "@/components/website/conversion-cta-documents/conversion-cta-documents";
import { CvShowcase } from "@/components/website/cv-showcase/cv-showcase";
import { Faq } from "@/components/website/faq/faq";
import { FeatureTabs } from "@/components/website/feature-tabs/feature-tabs";
import { Footer } from "@/components/website/footer/footer";
import { Header } from "@/components/website/header/header";
import { Hero } from "@/components/website/hero/hero";
import { MarketplaceShowcase } from "@/components/website/marketplace-showcase/marketplace-showcase";
import { MobileShowcase } from "@/components/website/mobile-showcase/mobile-showcase";
import { NewsletterModal } from "@/components/website/newsletter-modal/newsletter-modal";
import { SignShowcase } from "@/components/website/sign-showcase/sign-showcase";
import { StyleSwitcher } from "@/components/website/style-switcher/style-switcher";
import { TemplateStrip } from "@/components/website/template-strip/template-strip";
import { Testimonials } from "@/components/website/testimonials/testimonials";
import { UseCases } from "@/components/website/use-cases/use-cases";
import { Workflow } from "@/components/website/workflow/workflow";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";

export const Landing = () => {
  return (
    <main className="min-h-screen bg-white text-nox-noir">
      <Header />
      <Hero />
      <Workflow />
      <TemplateStrip />
      <FeatureTabs />
      {documentSharingEnabled ? <SignShowcase /> : null}
      <Confidence />
      <UseCases />
      <ConversionCta
        // className="bg-base-200!"
        description="Your saved templates, account role, and document drafts live behind sign-in, so you can pick up exactly where you left off."
        placement="mid"
        title="Already know which template you need? Sign in and keep moving."
        visual={<ConversionCtaDocuments className="hidden lg:block" />}
      />
      <ClientsShowcase />
      <CvShowcase />
      <MarketplaceShowcase />
      <StyleSwitcher />
      <MobileShowcase />
      <Testimonials />
      {/* <ConversionCta
        description="Start with your existing account or create one in seconds. Either path takes you to the same focused document workspace."
        eyebrow="Final step"
        placement="final"
        title="Get into Dokiments and create the document."
      /> */}
      <Faq />
      <Footer />
      <NewsletterModal />
    </main>
  );
};
