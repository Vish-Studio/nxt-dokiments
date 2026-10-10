interface Props {
  /** Placeholder tiles. Enough to overflow the row, as the real rail does. */
  count?: number;
}

/**
 * Shimmer stand-in for `MarketplaceCategoryNav` while the catalog loads.
 *
 * Same frame, heading and tile sizes as the loaded nav (a bordered card on
 * mobile, bare from `lg`; `size-24` tiles growing to `size-28`), so the page does
 * not shift when the real categories arrive. The heading is static copy, so it is
 * shown as is; only the tiles and the carousel controls shimmer.
 *
 * `aria-hidden`: the marketplace's own `LoadingStatus` is the one loading
 * announcement.
 */
export const MarketplaceCategoryNavSkeleton = ({ count = 10 }: Props) => (
  <div
    aria-hidden
    className="marketplace-category-nav-skeleton min-w-0 rounded-box border border-steel-mist bg-base-100 p-4 lg:border-0 lg:bg-transparent lg:p-0"
  >
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <p className="font-title text-xl font-bold text-nox-noir">
        Browse by category
      </p>
      {/* Mirrors the carousel header: full width below `sm`, stepper left and
          arrows right. */}
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
        <div className="skeleton h-1.5 w-16 rounded-full" />
        <div className="flex items-center gap-2">
          <div className="skeleton size-10 rounded-field" />
          <div className="skeleton size-10 rounded-field" />
        </div>
      </div>
    </div>

    {/* `py-2` matches the carousel viewport's own padding around the tiles. */}
    <div className="mt-4 flex gap-3 overflow-hidden py-2">
      {Array.from({ length: count }, (_, index) => (
        <div
          className="flex size-24 shrink-0 flex-col items-center justify-center gap-2 rounded-box border border-steel-mist bg-base-100 lg:size-28"
          key={index}
        >
          <div className="skeleton size-6 rounded-field" />
          <div className="skeleton h-3 w-14 rounded-field" />
        </div>
      ))}
    </div>
  </div>
);

export default MarketplaceCategoryNavSkeleton;
