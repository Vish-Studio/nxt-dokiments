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
    dragFree: true,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (emblaApi) {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
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

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">{header}</div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ButtonIcon
            aria-label="Scroll left"
            disabled={!canScrollPrev}
            icon={<CaretLeftIcon aria-hidden size={16} weight="bold" />}
            onClick={() => emblaApi?.scrollPrev()}
            shape="square"
            size="sm"
            variant="outline"
          />
          <ButtonIcon
            aria-label="Scroll right"
            disabled={!canScrollNext}
            icon={<CaretRightIcon aria-hidden size={16} weight="bold" />}
            onClick={() => emblaApi?.scrollNext()}
            shape="square"
            size="sm"
            variant="outline"
          />
        </div>
      </div>

      <div aria-label={ariaLabel} className="-mx-6 -my-6 mt-0 overflow-hidden px-6 py-6" ref={emblaRef}>
        <div className="flex gap-6 overflow-visible">{children}</div>
      </div>
    </div>
  );
};
