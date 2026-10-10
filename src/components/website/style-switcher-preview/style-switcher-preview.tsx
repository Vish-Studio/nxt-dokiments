import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { getSampleValues } from "@/lib/market-place";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export interface StyleSwitcherPreviewProps {
  /** Background token for the stage behind the document, e.g. `bg-play-teal`. */
  accent: string;
  className?: string;
  isActive: boolean;
  template: MarketplaceTemplate;
}

export const StyleSwitcherPreview = ({
  accent,
  className,
  isActive,
  template,
}: StyleSwitcherPreviewProps) => {
  return (
    <div
      aria-hidden={!isActive}
      className={cn(
        "style-switcher-preview absolute inset-0 flex justify-center px-6 pt-10 transition-opacity duration-500 motion-reduce:transition-none sm:px-12",
        accent,
        isActive ? "opacity-100" : "invisible opacity-0",
        className,
      )}
    >
      <TemplateDocument
        className={cn(
          "h-fit w-full max-w-md transition-[translate] duration-700 ease-out motion-reduce:transition-none",
          isActive ? "translate-y-0" : "translate-y-6",
        )}
        template={template}
        values={getSampleValues(template.documentType)}
      />
    </div>
  );
};
