"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  // Paused while the pointer or keyboard focus is inside, so a slide never
  // changes under someone reading it or about to press its button.
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
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
      isPaused ||
      slideCount < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const interval = window.setInterval(selectNext, 6500);

    return () => window.clearInterval(interval);
  }, [isPaused, selectNext, slideCount]);

  // A horizontal swipe of 40px or more changes slide on touch screens.
  const handleTouchEnd = (endX: number) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null || Math.abs(endX - startX) < 40) return;
    if (endX < startX) selectNext();
    else selectPrevious();
  };

  if (slideCount === 0) {
    return null;
  }

  const activeSlide = slides[activeIndex];
  return (
    <div
      aria-label="Marketplace updates"
      aria-roledescription="carousel"
      className="marketplace-promo-carousel"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
    >
      {/* The card holds only the slide; the controls sit below it, never on
          the copy or the picture. */}
      <div
        className="relative h-[35rem] sm:h-[23rem]"
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientX)}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
      >
        <MarketplacePromoSlide
          key={activeSlide.title}
          {...activeSlide}
        />
      </div>
      {slideCount > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-4 px-1">
          <StepIndicator
            current={activeIndex + 1}
            label="Slide"
            total={slideCount}
          />
          <div className="flex items-center gap-2">
            <ButtonIcon
              aria-label="Previous marketplace update"
              icon={
                <CaretLeftIcon
                  aria-hidden
                  size={14}
                  weight="bold"
                />
              }
              onClick={selectPrevious}
              shape="square"
              size="sm"
              variant="outline"
            />
            <ButtonIcon
              aria-label="Next marketplace update"
              icon={
                <CaretRightIcon
                  aria-hidden
                  size={14}
                  weight="bold"
                />
              }
              onClick={selectNext}
              shape="square"
              size="sm"
              variant="primary"
            />
          </div>
        </div>
      ) : null}
      <p
        aria-live="polite"
        className="sr-only"
      >
        Update {activeIndex + 1} of {slideCount}: {activeSlide.title}
      </p>
    </div>
  );
};

export default MarketplacePromoCarousel;
