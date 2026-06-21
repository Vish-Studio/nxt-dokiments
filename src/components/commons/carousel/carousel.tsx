"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";

export type CarouselProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  /** Content shown to the left of the navigation arrows (e.g. a category title). */
  header?: ReactNode;
};

export const Carousel = ({ ariaLabel, children, className, header }: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
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

  const progress = snapCount > 0 ? ((selectedIndex + 1) / snapCount) * 100 : 0;

  return (
    <div className={cn("app-carousel min-w-0", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">{header}</div>
        <div className="flex shrink-0 items-center gap-2">
          <ButtonIcon
            aria-label="Scroll left"
            disabled={!canScrollPrev}
            icon={<CaretLeftIcon aria-hidden size={16} weight="bold" />}
            onClick={() => emblaApi?.scrollPrev()}
            shape="square"
            size="sm"
            variant="secondary"
          />
          <ButtonIcon
            aria-label="Scroll right"
            disabled={!canScrollNext}
            icon={<CaretRightIcon aria-hidden size={16} weight="bold" />}
            onClick={() => emblaApi?.scrollNext()}
            shape="square"
            size="sm"
            variant="accent"
          />
        </div>
      </div>

      <div
        aria-label={ariaLabel}
        className="app-carousel-viewport -mx-2 mt-2 overflow-hidden px-2 py-4"
        ref={emblaRef}
      >
        <div className="app-carousel-track flex touch-pan-y gap-2">{children}</div>
      </div>

      {snapCount > 1 ? (
        <div className="mt-1 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-200">
            <div
              className="h-full rounded-full bg-golden-harvest transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="min-w-10 text-right font-title text-xs font-bold text-nox-noir/45">
            {selectedIndex + 1}/{snapCount}
          </p>
        </div>
      ) : null}
    </div>
  );
};
