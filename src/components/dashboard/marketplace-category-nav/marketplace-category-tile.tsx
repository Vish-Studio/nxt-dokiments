import { SquaresFourIcon } from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { documentIcons } from "@/lib/market-place/document-icons";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types/template";
import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";

interface Props {
  compact?: boolean;
  documentType: "all" | DocumentType;
  isActive: boolean;
  onSelect: (documentType: "all" | DocumentType) => void;
}

export const MarketplaceCategoryTile = ({ compact = false, documentType, isActive, onSelect }: Props) => {
  const Icon = documentType === "all" ? SquaresFourIcon : documentIcons[documentType];
  const label = documentType === "all" ? "All templates" : getDocumentTypeLabel(documentType);

  return (
    <Button
      aria-pressed={isActive}
      className={cn(
        // Content-width chip: icon left, full label right, never truncated.
        "marketplace-category-nav__tile w-auto shrink-0 gap-2 whitespace-nowrap rounded-box border px-4 font-medium shadow-none",
        compact ? "h-10 min-h-10 text-xs" : "h-12 min-h-12 text-sm",
        isActive
          ? "border-nox-noir bg-nox-noir text-base-100 hover:bg-nox-noir hover:text-base-100"
          : "border-steel-mist bg-base-100 text-nox-noir hover:border-nox-noir hover:bg-base-200",
      )}
      icon={<Icon aria-hidden size={compact ? 18 : 20} weight={isActive ? "fill" : "regular"} />}
      iconPosition="left"
      onClick={() => onSelect(documentType)}
      variant="ghost"
    >
      <span>{label}</span>
    </Button>
  );
};
