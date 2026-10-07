import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import { getStyleLabel } from "@/components/website/style-display/style-display";
import type { MarketplaceTemplate } from "@/types/template";

export interface TemplateStripItemProps {
  template: MarketplaceTemplate;
}

export const TemplateStripItem = ({ template }: TemplateStripItemProps) => {
  return (
    <div className="template-strip-item w-52 shrink-0 pr-6">
      <TemplateThumbnail template={template} />
      <p className="mt-3 truncate font-title text-sm font-bold text-nox-noir">
        {template.name}
      </p>
      <p className="text-xs text-nox-noir/65">
        {getStyleLabel(template.style.id)}
      </p>
    </div>
  );
};
