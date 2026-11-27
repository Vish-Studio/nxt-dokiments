import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import type { KeyboardEvent, Ref } from "react";

import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import { getTemplateDisplayName } from "@/lib/market-place/document-labels";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export interface TemplatePickerRowProps {
  /** Muted second line, e.g. "Modern · used 2 days ago". */
  caption: string;
  /** Desktop only: the card shown in the preview pane. */
  isSelected?: boolean;
  /** Click or tap. The picker decides whether that selects or starts. */
  onActivate: () => void;
  /** Double-click: starts the document from this template straight away. */
  onUse?: () => void;
  /** Arrow keys and Enter, handled by the picker for the whole list. */
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLButtonElement>;
  template: MarketplaceTemplate;
}

/**
 * One saved template in the picker list, as its own card: a 40px A4
 * thumbnail (a real page scaled down, like the marketplace cards), the name
 * in bold and a muted caption.
 *
 * The marker on the right says what a click does. Desktop shows a radio
 * circle (pick one to preview), filled golden with a check on the selected
 * card, which also gets a golden ring and a pale gold fill. Phones show an
 * arrow, because a tap starts the document straight away.
 */
export const TemplatePickerRow = ({
  caption,
  isSelected = false,
  onActivate,
  onKeyDown,
  onUse,
  ref,
  template,
}: TemplatePickerRowProps) => {
  const name = getTemplateDisplayName(template);

  return (
    <button
      aria-current={isSelected ? "true" : undefined}
      aria-label={`${name}, ${caption}`}
      className={cn(
        "template-picker-row flex min-h-18 w-full items-center gap-3 rounded-box border border-steel-mist bg-base-100 px-3 py-2.5 text-left transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir/30",
        isSelected &&
          "lg:border-golden-harvest lg:bg-golden-harvest/15 lg:ring-1 lg:ring-golden-harvest lg:hover:bg-golden-harvest/20",
      )}
      data-template-id={template.id}
      onClick={onActivate}
      onDoubleClick={onUse}
      onKeyDown={onKeyDown}
      ref={ref}
      type="button"
    >
      <span className="w-10 shrink-0">
        <TemplateThumbnail
          elevation="small"
          tiny
          template={template}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-title text-[0.9375rem] font-bold text-nox-noir">
          {name}
        </span>
        <span className="block truncate text-[0.8125rem] text-nox-noir/60">
          {caption}
        </span>
      </span>

      {/* Desktop: a radio circle, because a click selects. */}
      {isSelected ? (
        <span
          aria-hidden
          className="hidden size-6 shrink-0 place-items-center rounded-full bg-golden-harvest text-nox-noir lg:grid"
        >
          <CheckIcon
            size={13}
            weight="bold"
          />
        </span>
      ) : (
        <span
          aria-hidden
          className="hidden size-5.5 shrink-0 rounded-full border-2 border-steel-mist lg:block"
        />
      )}
      {/* Phones: an arrow, because a tap starts the document. */}
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-full bg-base-200 text-nox-noir lg:hidden"
      >
        <ArrowRightIcon
          size={14}
          weight="bold"
        />
      </span>
    </button>
  );
};

export default TemplatePickerRow;
