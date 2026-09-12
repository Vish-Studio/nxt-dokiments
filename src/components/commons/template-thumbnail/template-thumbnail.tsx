import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { getSampleValues } from "@/lib/market-place";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export type TemplateThumbnailProps = {
  className?: string;
  compact?: boolean;
  template: MarketplaceTemplate;
  values?: Record<string, string>;
};

/**
 * A non-interactive, scaled-down preview of a rendered template. Defaults to
 * sample content so marketplace previews show how a filled document looks.
 */
export const TemplateThumbnail = ({
  className,
  compact = false,
  template,
  values,
}: TemplateThumbnailProps) => {
  const resolvedValues = values ?? getSampleValues(template.documentType);

  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-210/297 w-full overflow-visible bg-transparent",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 origin-top-left overflow-hidden",
          compact ? "h-[400%] w-[400%] scale-25" : "h-[200%] w-[200%] scale-50",
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
