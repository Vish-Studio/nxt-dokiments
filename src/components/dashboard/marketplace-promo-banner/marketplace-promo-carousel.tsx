"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";

import {
  MarketplacePromoSlide,
  type MarketplacePromoSlideProps,
} from "./marketplace-promo-slide";

interface MarketplacePromoCarouselProps {
  slides: MarketplacePromoSlideProps[];
}

export const MarketplacePromoCarousel = ({
  slides,
}: MarketplacePromoCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = slides.length;

  const selectPrevious = useCallback(() => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? slideCount - 1 : currentIndex - 1,
    );
  }, [slideCount]);

  const selectNext = useCallback(() => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (
      slideCount < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const interval = window.setInterval(selectNext, 6500);

    return () => window.clearInterval(interval);
  }, [selectNext, slideCount]);

  if (slideCount === 0) {
    return null;
  }

  const activeSlide = slides[activeIndex];

  return (
    <div
      aria-label="Marketplace updates"
      aria-roledescription="carousel"
      className="marketplace-promo-carousel relative h-96"
      role="region"
    >
      <MarketplacePromoSlide
        key={activeSlide.title}
        {...activeSlide}
      />
      <p aria-live="polite" className="sr-only">
        Update {activeIndex + 1} of {slideCount}: {activeSlide.title}
      </p>

      {slideCount > 1 ? (
        <div className="absolute right-5 top-5 z-20 flex items-center gap-2 sm:right-8 sm:top-8 lg:right-10 lg:top-10">
          <ButtonIcon
            aria-label="Previous Marketplace update"
            className="border-base-100/40 bg-nox-noir/70 !text-base-100 hover:bg-nox-noir"
            icon={
              <ArrowLeftIcon
                aria-hidden
                className="block text-base-100"
                size={18}
                weight="bold"
              />
            }
            onClick={selectPrevious}
            shape="square"
            size="sm"
            variant="outline"
          />
          <ButtonIcon
            aria-label="Next Marketplace update"
            className="border-base-100 bg-base-100 !text-nox-noir hover:bg-base-200"
            icon={
              <ArrowRightIcon
                aria-hidden
                className="block text-nox-noir"
                size={18}
                weight="bold"
              />
            }
            onClick={selectNext}
            shape="square"
            size="sm"
            variant="outline"
          />
        </div>
      ) : null}
    </div>
  );
};

export default MarketplacePromoCarousel;
