import { TemplateDocument } from "@/components/template-document/template-document";
import { getSampleValues } from "@/lib/market-place";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export type TemplateThumbnailProps = {
  className?: string;
  template: MarketplaceTemplate;
  values?: Record<string, string>;
};

/**
 * A non-interactive, scaled-down preview of a rendered template. Defaults to
 * sample content so marketplace previews show how a filled document looks.
 */
export const TemplateThumbnail = ({ className, template, values }: TemplateThumbnailProps) => {
  const resolvedValues = values ?? getSampleValues(template.documentType);

  return (
    <div
      aria-hidden
      className={cn(
        "relative h-44 overflow-hidden rounded-lg border border-steel-mist bg-base-200",
        className,
      )}
    >
      <div className="pointer-events-none absolute left-0 top-0 w-[200%] origin-top-left scale-50">
        <TemplateDocument template={template} values={resolvedValues} />
      </div>
    </div>
  );
};
