import { SquaresFourIcon } from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { documentIcons } from "@/lib/market-place/document-icons";
import { documentBlueprints } from "@/lib/market-place/documents";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types/template";

interface Props {
  compact?: boolean;
  documentType: "all" | DocumentType;
  isActive: boolean;
  onSelect: (documentType: "all" | DocumentType) => void;
}

export const MarketplaceCategoryTile = ({ compact = false, documentType, isActive, onSelect }: Props) => {
  const Icon = documentType === "all" ? SquaresFourIcon : documentIcons[documentType];
  const label = documentType === "all" ? "All templates" : documentBlueprints[documentType].name;

  return (
    <Button
      aria-pressed={isActive}
      className={cn(
        "marketplace-category-nav__tile shrink-0 flex-col gap-2 rounded-box border px-3 py-3 text-center text-xs leading-4 shadow-none",
        compact ? "h-24 min-h-24 w-24 min-w-24" : "h-28 min-h-28 w-28 min-w-28",
        isActive
          ? "border-nox-noir bg-nox-noir text-base-100 hover:bg-nox-noir hover:text-base-100"
          : "border-steel-mist bg-base-100 text-nox-noir hover:border-nox-noir hover:bg-base-200",
      )}
      icon={<Icon aria-hidden size={compact ? 20 : 24} weight={isActive ? "fill" : "regular"} />}
      iconPosition="left"
      onClick={() => onSelect(documentType)}
      variant="ghost"
    >
      <span className="line-clamp-2">{label}</span>
    </Button>
  );
};
