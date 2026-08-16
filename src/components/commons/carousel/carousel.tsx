"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";

export type CarouselProps = {
  ariaLabel?: string;
  /** Advances through slides at the supplied interval while motion is allowed. */
  autoPlay?: boolean;
  autoPlayInterval?: number;
  children: ReactNode;
  className?: string;
  /** Content shown to the left of the navigation arrows (e.g. a category title). */
  header?: ReactNode;
  /** Overrides the default spacing between carousel slides. */
  trackClassName?: string;
  /** Adds layout space within the clipped carousel viewport. */
  viewportClassName?: string;
};

export const Carousel = ({
  ariaLabel,
  autoPlay = false,
  autoPlayInterval = 6000,
  children,
  className,
  header,
  trackClassName,
  viewportClassName,
}: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    loop: autoPlay,
    slidesToScroll: 1,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setSnapCount(emblaApi.scrollSnapList().length);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    // Sync initial arrow state once Embla has mounted (it isn't ready on first render).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (
      !autoPlay ||
      !emblaApi ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const interval = window.setInterval(
      () => emblaApi.scrollNext(),
      autoPlayInterval,
    );

    return () => window.clearInterval(interval);
  }, [autoPlay, autoPlayInterval, emblaApi]);

  const progress = snapCount > 0 ? ((selectedIndex + 1) / snapCount) * 100 : 0;
  const currentSlide = String(selectedIndex + 1).padStart(2, "0");
  const totalSlides = String(snapCount).padStart(2, "0");

  return (
    <div className={cn("app-carousel min-w-0", className)}>
      {header ? <div className="min-w-0">{header}</div> : null}

      <div
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        className={cn(
          "app-carousel-viewport overflow-hidden py-2",
          header ? "mt-4" : "mt-0",
          viewportClassName,
        )}
        ref={emblaRef}
        role="region"
      >
        <div className={cn("app-carousel-track flex touch-pan-y gap-4", trackClassName)}>
          {children}
        </div>
      </div>

      {snapCount > 1 ? (
        <div className="mt-4 flex items-center gap-4 border-t border-nox-noir/10 pt-4">
          <p
            aria-live="polite"
            className="min-w-14 font-title text-xs font-bold tabular-nums text-nox-noir/50"
          >
            <span className="text-nox-noir">{currentSlide}</span>
            <span aria-hidden className="px-1 text-nox-noir/25">/</span>
            {totalSlides}
          </p>

          <div className="h-px flex-1 overflow-hidden bg-nox-noir/10">
            <div
              className="h-full bg-nox-noir transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ButtonIcon
              aria-label="Previous slide"
              className="border-nox-noir/15 bg-transparent text-nox-noir hover:bg-nox-noir/5 disabled:bg-transparent"
              disabled={!canScrollPrev}
              icon={<CaretLeftIcon aria-hidden size={16} weight="bold" />}
              onClick={() => emblaApi?.scrollPrev()}
              shape="square"
              size="sm"
              variant="outline"
            />
            <ButtonIcon
              aria-label="Next slide"
              className="border-nox-noir bg-nox-noir text-white hover:bg-nox-noir disabled:border-nox-noir/15 disabled:bg-transparent disabled:text-nox-noir/30"
              disabled={!canScrollNext}
              icon={<CaretRightIcon aria-hidden size={16} weight="bold" />}
              onClick={() => emblaApi?.scrollNext()}
              shape="square"
              size="sm"
              variant="primary"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
