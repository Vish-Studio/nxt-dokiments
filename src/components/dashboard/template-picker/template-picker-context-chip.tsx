import { BuildingsIcon, XIcon } from "@phosphor-icons/react";

import { iconSize } from "@/lib/icons";

export interface TemplatePickerContextChipProps {
  /** Who the new document is for, e.g. the company the user started from. */
  label: string;
  /** Drops the prefill, so the next document starts with an empty client block. */
  onClear: () => void;
}

/**
 * Reminds the user who the new document is for while they pick a template,
 * when they started from a company page. The client details are prefilled once
 * a template is chosen; clearing the chip cancels that.
 */
export const TemplatePickerContextChip = ({
  label,
  onClear,
}: TemplatePickerContextChipProps) => (
  <div className="template-picker-context-chip flex h-10 items-center gap-2 rounded-field border border-steel-mist bg-base-100 pl-3 text-sm">
    <BuildingsIcon
      aria-hidden
      className="shrink-0 text-nox-noir/60"
      size={iconSize.control}
      weight="bold"
    />
    <span className="min-w-0 flex-1 truncate">
      <span className="text-nox-noir/60">For: </span>
      <span className="font-semibold text-nox-noir">{label}</span>
    </span>
    <button
      aria-label={`Don't prefill ${label}`}
      className="grid size-10 shrink-0 place-items-center rounded-field text-nox-noir/60 hover:bg-base-200 hover:text-nox-noir focus-visible:outline-2 focus-visible:outline-nox-noir/30"
      onClick={onClear}
      type="button"
    >
      <XIcon
        aria-hidden
        size={iconSize.control}
        weight="bold"
      />
    </button>
  </div>
);

export default TemplatePickerContextChip;
