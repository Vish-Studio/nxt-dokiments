import { HeroActions } from "@/components/website/hero-actions/hero-actions";
import { HeroFeaturePoints } from "@/components/website/hero-feature-points/hero-feature-points";
import { HeroLegal } from "@/components/website/hero-legal/hero-legal";
import { HeroProductMockup } from "@/components/website/hero-product-mockup/hero-product-mockup";

export const Hero = () => {
  return (
    <section
      className="relative flex min-h-screen overflow-hidden bg-nox-noir px-5 pt-24 pb-5 text-white sm:px-8 md:pt-24 md:pb-8 lg:px-10"
      id="top"
    >
      <div className="absolute left-1/2 top-28 h-80 w-[58rem] -translate-x-1/2 rounded-full bg-golden-harvest/10 blur-3xl website-drift" />

      <div className="relative z-10 mx-auto flex w-full flex-col">
        <div className="website-hero-copy grid w-full overflow-hidden rounded-[1.75rem] bg-white text-nox-noir shadow-[0_30px_90px_rgb(0_0_0_/_0.36)] lg:grid-cols-[0.88fr_1.12fr]">
          <div className="z-2 relative flex h-auto min-w-0 w-full flex-col items-center justify-center px-6 py-20 pb-4 text-center md:min-h-[520px] sm:px-8 sm:py-24 lg:h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-8rem)] lg:items-start lg:px-12 lg:py-12 lg:pr-0! lg:text-left">
            <div className="flex h-full w-full max-w-md flex-col justify-center md:max-w-2xl lg:max-w-xl">
              <h1 className="mx-auto w-full max-w-md font-title text-3xl font-bold leading-[0.98] text-nox-noir md:text-4xl lg:mx-0 lg:max-w-3xl lg:text-5xl">
                Business documents without the blank page.
              </h1>
              <p className="mx-auto mt-6 w-full max-w-md text-base leading-7 text-nox-noir/64 sm:text-md sm:leading-8 lg:mx-0 lg:max-w-2xl">
                Find polished invoices, contracts, quotations, and templates
                your team can customize, save, and reuse in minutes.
              </p>

              <HeroLegal className="mt-4 block md:hidden lg:absolute lg:bottom-10 lg:left-12 lg:mt-0" />

              <HeroFeaturePoints />

              <HeroActions className="mt-10" />
            </div>

            <HeroLegal className="mt-12 hidden md:flex lg:absolute lg:bottom-10 lg:left-12 lg:mt-0 w-full" />
          </div>

          <HeroProductMockup />
        </div>
      </div>
    </section>
  );
};
