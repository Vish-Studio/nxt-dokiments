import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export interface TemplateCardProps {
  className?: string;
  variant?: "default" | "gallery";
  locked?: boolean;
  onPreview: () => void;
  saved?: boolean;
  template: MarketplaceTemplate;
  values?: Record<string, string>;
};

export const TemplateCard = ({
  className,
  variant = "default",
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
        "template-card group block overflow-visible rounded-box bg-transparent p-2 text-left transition-colors duration-200 hover:bg-base-200 focus:outline-none focus-visible:bg-base-200 focus-visible:ring-2 focus-visible:ring-nox-noir/20",
        variant === "gallery" ? "w-full min-w-0" : "mx-auto w-64 sm:w-72",
        saved && "focus-visible:ring-golden-harvest/55",
        className,
      )}
      onClick={onPreview}
      type="button"
    >
      <TemplateThumbnail
        compact={variant === "gallery"}
        className="rounded-box bg-base-100 shadow-soft"
        template={template}
        values={values}
      />
      {variant === "gallery" ? (
        <span className="mt-3 block text-center">
          <span className="block font-title text-sm font-semibold leading-5 text-nox-noir">
            {template.name}
          </span>
          <span className="mt-1 block text-xs leading-5 text-nox-noir/60">
            {template.style.name}
          </span>
        </span>
      ) : null}
    </button>
  );
};

export default TemplateCard;
