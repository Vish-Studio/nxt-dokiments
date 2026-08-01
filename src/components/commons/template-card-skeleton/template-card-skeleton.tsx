import { cn } from "@/lib/utils";

export type TemplateCardSkeletonProps = {
  className?: string;
};

/** Shimmer placeholder matching `TemplateCard`'s aspect ratio, for use while a template list is loading. */
export const TemplateCardSkeleton = ({
  className,
}: TemplateCardSkeletonProps) => (
  <div
    aria-hidden
    className={cn("skeleton aspect-210/297 w-full rounded-box", className)}
  />
);

export type TemplateCardSkeletonGridProps = {
  count?: number;
};

/** Grid of `TemplateCardSkeleton`s matching the layout used by My Templates and the Documents template picker. */
export const TemplateCardSkeletonGrid = ({
  count = 6,
}: TemplateCardSkeletonGridProps) => (
  <div
    aria-hidden
    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
  >
    {Array.from({ length: count }, (_, index) => (
      <TemplateCardSkeleton key={index} />
    ))}
  </div>
);
