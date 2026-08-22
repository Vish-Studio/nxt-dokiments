import Image from "next/image";

export const HeroProductMockup = () => {
  return (
    <div className="hero-product-mockup website-hero-visual h-52 lg:h-full">
      <div className="website-hero-parallax relative mx-auto h-52 w-52 overflow-hidden lg:hidden">
        <Image
          alt="Dokiments dashboard displayed on a mobile phone"
          className="absolute left-1/2 top-0 h-auto w-52 -translate-x-1/2"
          height={3200}
          sizes="208px"
          src="/images/mockups/hero-mobile.jpg"
          width={1586}
        />
      </div>

      <div className="website-hero-parallax relative left-20 hidden h-full min-h-[520px] items-center p-6 lg:flex">
        <div className="relative h-[70%] w-full">
          <Image
            alt="Dokiments workspace displayed on a laptop"
            className="absolute -right-16 top-0 h-full w-auto max-w-none"
            height={2149}
            sizes="(max-width: 1280px) 58vw, 840px"
            src="/images/mockups/hero-laptop.jpg"
            width={3522}
          />
        </div>
      </div>
    </div>
  );
};
