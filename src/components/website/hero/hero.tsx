import { HeroActions } from "@/components/website/hero-actions/hero-actions";
import { HeroFeaturePoints } from "@/components/website/hero-feature-points/hero-feature-points";
import { HeroProductMockup } from "@/components/website/hero-product-mockup/hero-product-mockup";

export const Hero = () => {
  return (
    <section
      className="relative flex min-h-screen overflow-hidden bg-nox-noir px-5 pt-24 pb-5 text-white sm:px-8 md:pt-24 md:pb-8 lg:px-10"
      id="top"
    >
      <div className="relative z-10 mx-auto flex w-full flex-col">
        <div className="website-hero-copy grid w-full overflow-hidden rounded-box bg-white text-nox-noir lg:grid-cols-[0.88fr_1.12fr]">
          <div className="z-2 relative flex h-auto min-w-0 w-full flex-col items-center justify-center px-6 py-20 pb-10 text-center md:min-h-[520px] sm:px-8 sm:py-24 lg:h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-8rem)] lg:items-start lg:px-12 lg:py-12 lg:pr-0! lg:text-left">
            <div className="flex h-full w-full max-w-md flex-col justify-center md:max-w-2xl lg:max-w-xl">
              <h1 className="mx-auto w-full max-w-md font-title text-4xl font-bold leading-tight tracking-tight text-nox-noir md:max-w-2xl md:text-5xl lg:mx-0 lg:max-w-3xl lg:text-6xl">
                Business documents{" "}
                <mark className="box-decoration-clone rounded-md bg-golden-harvest px-2 text-nox-noir">
                  without the blank page.
                </mark>
              </h1>
              <p className="mx-auto mt-6 w-full max-w-md text-base leading-7 text-nox-noir/64 sm:text-md sm:leading-8 lg:mx-0 lg:max-w-2xl">
                Find polished invoices, contracts, quotations, and templates you
                can customize, save, and reuse in minutes.
              </p>

              <HeroFeaturePoints />

              <HeroActions className="mt-10" />
            </div>
          </div>

          <HeroProductMockup />
        </div>
      </div>
    </section>
  );
};
