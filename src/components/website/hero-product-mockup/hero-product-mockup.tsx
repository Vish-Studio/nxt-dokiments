import Image from "next/image";


// Product photography (laptop) under a light nox-noir overlay, with the iPhone app for mobile support.
export const HeroProductMockup = () => {
  return (
    <div className="hero-product-mockup website-hero-visual p-3 lg:h-full lg:p-4">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-box bg-nox-noir lg:aspect-auto lg:h-full">
        <Image
          alt="Dokiments workspace displayed on a laptop"
          className="object-cover object-[40%_50%]"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          src="/images/mockups/hero-laptop-rock.webp"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-nox-noir/15"
        />

        <Image
          alt="Dokiments dashboard displayed on a mobile phone"
          className="website-float-delayed absolute bottom-4 right-4 z-10 h-auto w-1/4 max-w-44 sm:bottom-8 sm:right-8"
          height={1291}
          sizes="(min-width: 1024px) 12vw, 25vw"
          src="/images/mockups/hero-mobile-cutout.webp"
          width={640}
        />
      </div>
    </div>
  );
};
