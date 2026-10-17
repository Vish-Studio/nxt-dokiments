interface Props {
  /** Placeholder tiles. Enough to overflow the row, as the real rail does. */
  count?: number;
}

/**
 * Shimmer stand-in for `MarketplaceCategoryNav` while the catalog loads.
 *
 * Same frame, heading and tile sizes as the loaded nav (a bordered card on
 * mobile, bare from `lg`; content-width chips, `h-10` growing to `h-12`), so the page does
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
          className="flex h-10 shrink-0 items-center gap-2 rounded-box border border-steel-mist bg-base-100 px-4 lg:h-12"
          key={index}
        >
          <div className="skeleton size-5 rounded-field" />
          {/* Varied widths, like real labels of different lengths. */}
          <div className={index % 3 === 0 ? "skeleton h-3 w-20 rounded-field" : index % 3 === 1 ? "skeleton h-3 w-14 rounded-field" : "skeleton h-3 w-24 rounded-field"} />
        </div>
      ))}
    </div>
  </div>
);

export default MarketplaceCategoryNavSkeleton;
