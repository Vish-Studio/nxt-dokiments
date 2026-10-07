"use client";

import type { KeyboardEvent } from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { AuthShowcaseSlide } from "./auth-showcase-slide";
import {
  type AuthShowcaseSlideData,
  authShowcaseSlides,
} from "./auth-showcase-slides";
import { AuthShowcaseStep } from "./auth-showcase-step";

export interface AuthShowcaseProps {
  className?: string;
  slides?: AuthShowcaseSlideData[];
}

/**
 * Product tour beside the auth forms. Slides advance every 5s (timed by the
 * active step's progress bar in `globals.css`), pause while hovered or focused,
 * and stay put for users who prefer reduced motion.
 */
export const AuthShowcase = ({
  className,
  slides = authShowcaseSlides,
}: AuthShowcaseProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = slides.length;

  if (slideCount === 0) {
    return null;
  }

  const selectNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % slideCount);
  };

  const handleStepKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const offset =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!offset) return;

    event.preventDefault();
    const nextIndex = (activeIndex + offset + slideCount) % slideCount;
    setActiveIndex(nextIndex);
    event.currentTarget
      .querySelectorAll<HTMLButtonElement>("[role=tab]")
      [nextIndex]?.focus();
  };

  return (
    <section
      aria-label="Dokiments product tour"
      aria-roledescription="carousel"
      className={cn(
        "auth-showcase relative h-full overflow-hidden rounded-box bg-play-teal",
        className,
      )}
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <AuthShowcaseSlide
          {...slide}
          id={`auth-showcase-slide-${index}`}
          isActive={index === activeIndex}
          isFirst={index === 0}
          key={slide.step}
        />
      ))}

      <div
        aria-label="Product areas"
        className="absolute inset-x-0 bottom-8 flex gap-2 px-6 xl:gap-8 xl:px-12"
        onKeyDown={handleStepKeyDown}
        role="tablist"
      >
        {slides.map((slide, index) => (
          <AuthShowcaseStep
            controls={`auth-showcase-slide-${index}`}
            isActive={index === activeIndex}
            isPaused={isPaused}
            key={slide.step}
            label={slide.step}
            onComplete={selectNext}
            onSelect={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};
