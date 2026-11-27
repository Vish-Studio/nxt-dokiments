import { LoadingStatus } from "@/components/commons/loading-status/loading-status";

/**
 * Placeholder for the template picker while saved templates load: skeleton
 * list rows on every screen, plus an empty preview pane on desktop, in the
 * same two-column frame as the loaded picker so nothing jumps.
 */
export const TemplatePickerSkeleton = () => (
  <div className="template-picker-skeleton grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[24rem_minmax(0,1fr)]">
    <div className="rounded-box border border-steel-mist bg-base-100 p-4">
      <LoadingStatus message="Loading your templates…" />
      <div className="skeleton h-10 w-full rounded-field" />
      <div className="mt-6 grid gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="flex items-center gap-3"
            key={index}
          >
            <div className="skeleton h-14 w-10 shrink-0 rounded-sm" />
            <div className="grid flex-1 gap-2">
              <div className="skeleton h-3.5 w-3/5" />
              <div className="skeleton h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="skeleton hidden rounded-box lg:block" />
  </div>
);

export default TemplatePickerSkeleton;
