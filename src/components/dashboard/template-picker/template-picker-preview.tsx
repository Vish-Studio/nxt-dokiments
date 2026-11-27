import { ArrowRightIcon, ArrowsOutIcon, InfoIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/commons/badge/badge";
import { Button } from "@/components/commons/button/button";
import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import {
  getDocumentTypeLabel,
  getTemplateDisplayName,
} from "@/lib/market-place/document-labels";
import { iconSize } from "@/lib/icons";
import type { MarketplaceTemplate } from "@/types/template";

export interface TemplatePickerPreviewProps {
  /** The company the document is for, when started from a company page. */
  contextLabel?: string;
  /** Opens the full-size preview dialog for this template. */
  onPreview: () => void;
  /** Starts a new document from this template. */
  onUse: () => void;
  template: MarketplaceTemplate;
}

/**
 * Desktop-only right pane of the template picker: the selected template as a
 * large A4 page, with the golden "Use this template" (the page's one main
 * action) always in reach in the footer.
 * Phones skip it; a tap on a row opens the editor directly.
 */
export const TemplatePickerPreview = ({
  contextLabel,
  onPreview,
  onUse,
  template,
}: TemplatePickerPreviewProps) => {
  const name = getTemplateDisplayName(template);
  const typeLabel = getDocumentTypeLabel(template.documentType);

  return (
    <section
      aria-label={`${name} preview`}
      className="template-picker-preview flex h-full min-h-0 flex-col overflow-hidden rounded-box border border-steel-mist bg-base-100"
    >
      <header className="border-b border-steel-mist px-6 py-4">
        <div className="flex items-center gap-2">
          {/* The type only when the name doesn't already say it ("CV", "CV"). */}
          {typeLabel === name ? null : <Badge>{typeLabel}</Badge>}
          <span className="text-sm text-nox-noir/60">
            {template.style.name}
          </span>
        </div>
        <h3 className="mt-2 truncate font-title text-xl font-bold text-nox-noir">
          {name}
        </h3>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto bg-base-200 px-6 py-8">
        <TemplateThumbnail
          className="mx-auto max-w-md"
          template={template}
        />
      </div>
      <footer className="flex items-center gap-3 border-t border-steel-mist px-6 py-3">
        <p className="flex min-w-0 flex-1 items-start gap-2 text-sm leading-5 text-nox-noir/60">
          <InfoIcon
            aria-hidden
            className="mt-0.5 shrink-0"
            size={iconSize.inline}
            weight="bold"
          />
          {contextLabel
            ? `Next, fill in the details. Your details and ${contextLabel} are already added.`
            : "Next, fill in the details. Your own details are already added."}
        </p>
        <Button
          className="shrink-0 whitespace-nowrap"
          icon={
            <ArrowsOutIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
          }
          iconPosition="left"
          onClick={onPreview}
          size="sm"
          variant="outline"
        >
          Preview full size
        </Button>
        <Button
          className="shrink-0 whitespace-nowrap"
          icon={
            <ArrowRightIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
          }
          iconMotion="right"
          iconPosition="right"
          onClick={onUse}
          size="sm"
          variant="accent"
        >
          Use this template
        </Button>
      </footer>
    </section>
  );
};

export default TemplatePickerPreview;
