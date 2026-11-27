import { CaretRightIcon } from "@phosphor-icons/react";
import type { KeyboardEvent, Ref } from "react";

import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import { getTemplateDisplayName } from "@/lib/market-place/document-labels";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export interface TemplatePickerRowProps {
  /** Muted second line, e.g. "Modern · used 2 days ago". */
  caption: string;
  /** Desktop only: the row shown in the preview pane. */
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
 * One saved template in the picker list: a 48px A4 thumbnail (a real page
 * scaled down, like the marketplace cards), the name and a
 * caption. On desktop the selected row gets a golden edge and drives the
 * preview pane; on phones the chevron signals that a tap opens the editor.
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
        "template-picker-row relative flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-base-200 focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nox-noir/30",
        isSelected &&
          "lg:bg-base-200 lg:before:absolute lg:before:inset-y-0 lg:before:left-0 lg:before:w-1 lg:before:bg-golden-harvest",
      )}
      data-template-id={template.id}
      onClick={onActivate}
      onDoubleClick={onUse}
      onKeyDown={onKeyDown}
      ref={ref}
      type="button"
    >
      <span
        className={cn(
          "w-12 shrink-0",
          isSelected &&
            "lg:outline-2 lg:outline-offset-2 lg:outline-golden-harvest",
        )}
      >
        <TemplateThumbnail
          elevation="small"
          tiny
          template={template}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-title text-[0.9375rem] font-semibold text-nox-noir lg:text-sm">
          {name}
        </span>
        <span className="block truncate text-[0.8125rem] text-nox-noir/60 lg:text-xs">
          {caption}
        </span>
      </span>
      <CaretRightIcon
        aria-hidden
        className="shrink-0 text-nox-noir/40 lg:hidden"
        size={iconSize.control}
        weight="bold"
      />
    </button>
  );
};

export default TemplatePickerRow;
