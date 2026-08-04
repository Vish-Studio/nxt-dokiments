import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { HeroProductMockup } from "@/components/website/hero-product-mockup/hero-product-mockup";

export const Hero = () => {
  return (
    <section
      className="relative flex min-h-screen overflow-hidden bg-nox-noir px-5 pt-24 pb-5 text-white sm:px-8 md:pt-24 md:pb-8 lg:px-10"
      id="top"
    >
      <div className="absolute left-1/2 top-28 h-80 w-[58rem] -translate-x-1/2 rounded-full bg-golden-harvest/10 blur-3xl website-drift" />

      <div className="relative z-10 mx-auto flex w-full items-stretch">
        <div className="website-hero-copy grid w-full overflow-hidden rounded-[1.75rem] bg-white text-nox-noir shadow-[0_30px_90px_rgb(0_0_0_/_0.36)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex min-h-[520px] flex-col justify-center p-6 sm:p-8 lg:min-h-[calc(100vh-8rem)] lg:p-12">
            <div>
              <h1 className="max-w-3xl font-title text-4xl md:text-5xl lg:text-7xl font-bold leading-[0.98] text-nox-noir">
                Business documents without the blank page.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-nox-noir/64 sm:text-lg sm:leading-8">
                Find polished invoices, contracts, quotations, and templates
                your team can customize, save, and reuse in minutes.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-9">
                <LinkButton
                  href="/sign-up"
                  icon={<ArrowRight aria-hidden size={18} weight="bold" />}
                  size="lg"
                >
                  Sign up
                </LinkButton>
                <LinkButton href="#marketplace" icon={null} size="lg" variant="outline">
                  Browse marketplace
                </LinkButton>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-nox-noir/58">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-golden-harvest" />
                  Free to start
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-golden-harvest" />
                  Mobile responsive
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-golden-harvest" />
                  Role-based access
                </span>
              </div>
            </div>

          </div>

          <HeroProductMockup />
        </div>
      </div>
    </section>
  );
};
