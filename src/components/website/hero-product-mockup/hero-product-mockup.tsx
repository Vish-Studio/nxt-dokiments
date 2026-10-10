import Image from "next/image";

import { HeroDocumentPreview } from "@/components/website/hero-document-preview/hero-document-preview";

export const HeroProductMockup = () => {
  return (
    <div className="hero-product-mockup website-hero-visual p-3 lg:h-full lg:p-4">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-box bg-play-blue lg:aspect-auto lg:h-full">
        <Image
          alt="Dokiments workspace displayed on a laptop"
          className="absolute left-1/12 top-1/12 h-auto w-11/12 max-w-none"
          height={1098}
          priority
          sizes="(min-width: 1024px) 50vw, 90vw"
          src="/images/mockups/hero-laptop-cutout.webp"
          width={1800}
        />
        <Image
          alt="Dokiments dashboard displayed on a mobile phone"
          className="website-float-delayed absolute -bottom-1/12 left-1/12 z-10 h-auto w-1/3 max-w-none"
          height={1291}
          priority
          sizes="(min-width: 1024px) 18vw, 30vw"
          src="/images/mockups/hero-mobile-cutout.webp"
          width={640}
        />
        <HeroDocumentPreview className="website-float absolute bottom-1/12 right-1/12 z-20 hidden w-2/5 lg:block" />
      </div>
    </div>
  );
};
