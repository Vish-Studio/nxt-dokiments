import { TemplateThumbnail } from "@/components/template-thumbnail/template-thumbnail";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export type TemplateCardProps = {
  className?: string;
  locked?: boolean;
  onPreview: () => void;
  saved?: boolean;
  template: MarketplaceTemplate;
  values?: Record<string, string>;
};

export const TemplateCard = ({
  className,
  locked = false,
  onPreview,
  saved = false,
  template,
  values,
}: TemplateCardProps) => {
  return (
    <button
      aria-label={`Preview ${template.name}${saved ? ", saved" : ""}${locked ? ", locked" : ""}`}
      className={cn(
        "group mx-auto block w-64 overflow-visible bg-transparent p-0 text-left transition duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-nox-noir/20 sm:w-72",
        saved && "focus-visible:ring-golden-harvest/55",
        className,
      )}
      onClick={onPreview}
      type="button"
    >
      <TemplateThumbnail
        className="transition duration-200 group-hover:-translate-y-1 group-hover:scale-[1.02]"
        template={template}
        values={values}
      />
    </button>
  );
};
