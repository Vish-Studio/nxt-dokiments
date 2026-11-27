import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types/template";

export interface TemplatePickerFiltersProps {
  /** The selected type chip, or `"all"`. */
  documentType: DocumentType | "all";
  /** The types the user owns templates for, in display order. One chip each. */
  documentTypes: readonly DocumentType[];
  onDocumentType: (documentType: DocumentType | "all") => void;
  onSearch: (search: string) => void;
  search: string;
}

/**
 * Search box and a row of type chips above the template picker list. The
 * chips scroll sideways on phones rather than wrapping, so the row keeps one
 * height. Chips are toggle buttons (`aria-pressed`), one per owned type.
 */
export const TemplatePickerFilters = ({
  documentType,
  documentTypes,
  onDocumentType,
  onSearch,
  search,
}: TemplatePickerFiltersProps) => {
  const chips: { label: string; value: DocumentType | "all" }[] = [
    { label: "All", value: "all" },
    ...documentTypes.map((value) => ({
      label: getDocumentTypeLabel(value),
      value,
    })),
  ];

  return (
    <div className="template-picker-filters grid gap-3">
      <div className="relative">
        <MagnifyingGlassIcon
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-nox-noir/45"
          size={iconSize.control}
          weight="bold"
        />
        <input
          aria-label="Search your templates"
          className="h-11 w-full rounded-field border border-steel-mist bg-base-100 pl-9 pr-10 font-body text-base text-nox-noir placeholder:text-nox-noir/45 focus:border-nox-noir/40 focus:outline-none lg:h-10 lg:text-sm"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search your templates"
          role="searchbox"
          type="text"
          value={search}
        />
        {search ? (
          <button
            aria-label="Clear search"
            className="absolute right-0 top-0 grid size-11 place-items-center text-nox-noir/60 hover:text-nox-noir lg:size-10"
            onClick={() => onSearch("")}
            type="button"
          >
            <XIcon
              aria-hidden
              size={iconSize.control}
            />
          </button>
        ) : null}
      </div>
      {documentTypes.length > 1 ? (
        <div
          aria-label="Template type"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0"
          role="group"
        >
          {chips.map((chip) => {
            const isActive = chip.value === documentType;

            return (
              <button
                aria-pressed={isActive}
                className={cn(
                  "h-9 shrink-0 rounded-field border px-3 font-title text-sm font-semibold transition-colors",
                  isActive
                    ? "border-nox-noir bg-nox-noir text-white"
                    : "border-steel-mist bg-base-100 text-nox-noir hover:bg-base-200",
                )}
                key={chip.value}
                onClick={() => onDocumentType(chip.value)}
                type="button"
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default TemplatePickerFilters;
