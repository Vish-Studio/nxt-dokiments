"use client";

import { useCallback, useEffect, useState } from "react";

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
    </div>
  );
};

export default MarketplacePromoCarousel;
