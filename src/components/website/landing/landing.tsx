import { Confidence } from "@/components/website/confidence/confidence";
import { ConversionCta } from "@/components/website/conversion-cta/conversion-cta";
import { Faq } from "@/components/website/faq/faq";
import { Footer } from "@/components/website/footer/footer";
import { Header } from "@/components/website/header/header";
import { Hero } from "@/components/website/hero/hero";
import { MarketplaceShowcase } from "@/components/website/marketplace-showcase/marketplace-showcase";
import { NewsletterModal } from "@/components/website/newsletter-modal/newsletter-modal";
import { Overview } from "@/components/website/overview/overview";
import { Pricing } from "@/components/website/pricing/pricing";
import { UseCases } from "@/components/website/use-cases/use-cases";
import { Workflow } from "@/components/website/workflow/workflow";
import { Testimonials } from "@/components/website/testimonials/testimonials";

export const Landing = () => {
  return (
    <main className="min-h-screen bg-white text-nox-noir">
      <Header />
      <Hero />
      <Overview />
      <MarketplaceShowcase />
      <ConversionCta
        description="Your saved templates, account role, and document drafts live behind sign-in, so returning users can continue without starting from scratch."
        placement="mid"
        title="Already know which template you need? Sign in and keep moving."
      />
      <UseCases />
      <Testimonials />
      <Pricing />
      <ConversionCta
        description="Choose a plan from your account, keep your saved library intact, and generate business documents from the templates you already trust."
        eyebrow="Workspace access"
        placement="post_pricing"
        title="Sign in before picking up the next document."
      />
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
