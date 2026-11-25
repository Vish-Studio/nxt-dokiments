import { HeroShowcase } from "@/components/website/hero-showcase/hero-showcase";

export const Hero = () => {
  return (
    <section
      className="relative flex min-h-screen overflow-hidden bg-nox-noir px-5 pt-24 pb-5 text-white sm:px-8 md:pt-24 md:pb-8 lg:px-10"
      id="top"
    >
      <div className="relative z-10 mx-auto flex w-full flex-col">
        <div className="website-hero-copy grid w-full overflow-hidden rounded-box bg-white text-nox-noir lg:grid-cols-[0.88fr_1.12fr]">
          {/* The intro card's steps drive the device scene beside it. */}
          <HeroShowcase />
        </div>
      </div>
    </section>
  );
};
