import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import { getTemplateById } from "@/lib/market-place";
import { cn } from "@/lib/utils";

export interface HeroDocumentPreviewProps {
  className?: string;
  templateId?: string;
}

export const HeroDocumentPreview = ({
  className,
  templateId = "minimalist-invoice",
}: HeroDocumentPreviewProps) => {
  const template = getTemplateById(templateId);

  if (!template) {
    return null;
  }

  return (
    <div className={cn("hero-document-preview", className)}>
      <TemplateThumbnail template={template} />
    </div>
  );
};
