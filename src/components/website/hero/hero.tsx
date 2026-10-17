import { HeroIntro } from "@/components/website/hero-intro/hero-intro";
import { HeroProductMockup } from "@/components/website/hero-product-mockup/hero-product-mockup";

export const Hero = () => {
  return (
    <section
      className="relative flex min-h-screen overflow-hidden bg-nox-noir px-5 pt-24 pb-5 text-white sm:px-8 md:pt-24 md:pb-8 lg:px-10"
      id="top"
    >
      <div className="relative z-10 mx-auto flex w-full flex-col">
        <div className="website-hero-copy grid w-full overflow-hidden rounded-box bg-white text-nox-noir lg:grid-cols-[0.88fr_1.12fr]">
          {/* Built from the dashboard's own parts: a welcome-style card and the snapshot rows. */}
          <div className="hero-intro-column flex min-w-0 flex-col p-3 lg:h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-8rem)] lg:p-4 lg:pr-0">
            <HeroIntro />
          </div>

          <HeroProductMockup />
        </div>
      </div>
    </section>
  );
};
