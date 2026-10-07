import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  current: number;
  total: number;
}

export const CarouselProgress = ({ className, current, total }: Props) => {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={cn("carousel-progress flex shrink-0 items-center gap-3", className)}>
      <p className="min-w-12 font-title text-xs font-bold tabular-nums text-nox-noir/50">
        <span className="text-nox-noir">{String(current).padStart(2, "0")}</span>
        <span aria-hidden className="px-1 text-nox-noir/35">/</span>
        {String(total).padStart(2, "0")}
      </p>
      <div
        aria-label="Carousel position"
        aria-valuemax={total}
        aria-valuemin={1}
        aria-valuenow={current}
        className="h-1 w-20 overflow-hidden bg-nox-noir/20 sm:w-24"
        role="progressbar"
      >
        <div
          className="h-full bg-nox-noir transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default CarouselProgress;
