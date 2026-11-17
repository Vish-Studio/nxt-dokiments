import type { Icon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface Props {
  /** Background token for the icon tile, e.g. `bg-play-blue`. */
  accent: string;
  detail: string;
  icon: Icon;
  isSelected: boolean;
  label: string;
  onSelect: () => void;
}

// One of the Client details source cards ("Saved client" / "New client"): a radio styled like
// the dashboard's snapshot rows. Selected is white with a noir border; unselected is the grey surface.
export const ClientSourceOption = ({
  accent,
  detail,
  icon: OptionIcon,
  isSelected,
  label,
  onSelect,
}: Props) => {
  return (
    <button
      aria-checked={isSelected}
      className={cn(
        "client-source-option flex min-w-0 items-center gap-3 rounded-field border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nox-noir/15 motion-reduce:transition-none",
        isSelected
          ? "border-nox-noir bg-base-100"
          : "border-transparent bg-base-200 hover:border-steel-mist",
      )}
      onClick={onSelect}
      role="radio"
      type="button"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md text-nox-noir",
          accent,
        )}
      >
        <OptionIcon
          aria-hidden
          size={18}
          weight="bold"
        />
      </span>
      <span className="grid min-w-0">
        <span className="font-title text-sm font-bold text-nox-noir">
          {label}
        </span>
        <span className="truncate text-xs text-nox-noir/55">{detail}</span>
      </span>
    </button>
  );
};

export default ClientSourceOption;
