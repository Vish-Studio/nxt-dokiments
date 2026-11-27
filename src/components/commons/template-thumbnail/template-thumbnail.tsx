import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { getSampleValues } from "@/lib/market-place";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export type TemplateThumbnailProps = {
  className?: string;
  /** Lays the page out 4× wider than the box (cards about 150–250px wide). */
  compact?: boolean;
  /**
   * How far the sheet lifts off its background. `"paper"` (default) is the
   * full `shadow-paper` of a document page; `"small"` is a tight contact
   * shadow for tiny thumbnails (list rows), where the full drop would halo.
   */
  elevation?: "paper" | "small";
  template: MarketplaceTemplate;
  /**
   * For list-row thumbnails about 40–56px wide: lays the page out 12.5× wider
   * than the box (a 48px box is a 600px page), so it shrinks like a real page
   * instead of reflowing into a broken narrow column. Wins over `compact`.
   */
  tiny?: boolean;
  values?: Record<string, string>;
};

/**
 * A non-interactive, scaled-down preview of a rendered template. Defaults to
 * sample content so marketplace previews show how a filled document looks.
 *
 * Drawn as a sheet of paper: white, square corners and a shadow beneath, so
 * callers never add their own rounding, border or card shadow around it.
 */
export const TemplateThumbnail = ({
  className,
  compact = false,
  elevation = "paper",
  template,
  tiny = false,
  values,
}: TemplateThumbnailProps) => {
  const resolvedValues = values ?? getSampleValues(template.documentType);

  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-210/297 w-full overflow-visible rounded-none bg-white",
        elevation === "paper"
          ? "shadow-paper"
          : "shadow-[0_1px_3px_rgb(20_20_20/0.18)]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 origin-top-left overflow-hidden bg-white",
          tiny
            ? "h-[1250%] w-[1250%] scale-[0.08]"
            : compact
              ? "h-[400%] w-[400%] scale-25"
              : "h-[200%] w-[200%] scale-50",
        )}
      >
        <TemplateDocument
          className="h-full min-h-full"
          template={template}
          values={resolvedValues}
        />
      </div>
    </div>
  );
};

export default TemplateThumbnail;
