"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { StepIndicator } from "@/components/commons/step-indicator/step-indicator";

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

  const selectNext = useCallback(() => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % slideCount);
  }, [slideCount]);

  const selectPrevious = useCallback(() => {
    setActiveIndex(
      (currentIndex) => (currentIndex - 1 + slideCount) % slideCount,
    );
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
      {slideCount > 1 ? (
        // Full width on mobile, so the stepper sits left and the arrows right;
        // from `sm` up the two sit together in the bottom-left corner.
        <div className="absolute right-5 bottom-5 left-5 z-20 flex items-center justify-between gap-4 sm:right-auto sm:bottom-8 sm:left-8 sm:justify-start lg:bottom-10 lg:left-10">
          <StepIndicator
            current={activeIndex + 1}
            label="Slide"
            total={slideCount}
          />
          <div className="flex items-center gap-2">
            <ButtonIcon
              aria-label="Previous marketplace update"
              className="border-nox-noir/25 bg-base-100/70 !text-nox-noir hover:bg-base-100"
              icon={
                <CaretLeftIcon aria-hidden size={14} weight="bold" />
              }
              onClick={selectPrevious}
              shape="square"
              size="sm"
              variant="outline"
            />
            <ButtonIcon
              aria-label="Next marketplace update"
              className="border-nox-noir bg-nox-noir !text-base-100 hover:bg-nox-noir/85"
              icon={
                <CaretRightIcon aria-hidden size={14} weight="bold" />
              }
              onClick={selectNext}
              shape="square"
              size="sm"
              variant="primary"
            />
          </div>
        </div>
      ) : null}
      <p aria-live="polite" className="sr-only">
        Update {activeIndex + 1} of {slideCount}: {activeSlide.title}
      </p>
    </div>
  );
};

export default MarketplacePromoCarousel;
