import { TemplateDocument } from "@/components/template-document/template-document";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export type TemplateThumbnailProps = {
  className?: string;
  template: MarketplaceTemplate;
  values?: Record<string, string>;
};

/** A non-interactive, scaled-down preview of a rendered template. */
export const TemplateThumbnail = ({ className, template, values }: TemplateThumbnailProps) => {
  return (
    <div
      aria-hidden
      className={cn(
        "relative h-44 overflow-hidden rounded-lg border border-steel-mist bg-base-200",
        className,
      )}
    >
      <div className="pointer-events-none absolute left-0 top-0 w-[200%] origin-top-left scale-50">
        <TemplateDocument template={template} values={values} />
      </div>
    </div>
  );
};
