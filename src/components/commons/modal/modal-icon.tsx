import {
  CheckCircleIcon,
  InfoIcon,
  SparkleIcon,
  WarningCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * What kind of message a modal carries; drives its icon tile colour.
 *
 * - `success`: something finished ("Document saved").
 * - `info`: neutral information or a reversible choice ("Add to My Templates?").
 * - `warning`: can go ahead, but read first ("Some fields are empty", signing locks a document).
 * - `danger`: destructive and permanent ("Delete document?", "Revoke access?").
 * - `brand`: upsell or product moments (upgrade prompt), in the brand golden.
 */
export type ModalTone = "brand" | "danger" | "info" | "success" | "warning";

const toneStyles: Record<ModalTone, { glyph: Icon; tile: string }> = {
  brand: { glyph: SparkleIcon, tile: "bg-golden-harvest text-nox-noir" },
  danger: { glyph: WarningCircleIcon, tile: "bg-error/10 text-error" },
  info: { glyph: InfoIcon, tile: "bg-play-blue/55 text-nox-noir" },
  success: { glyph: CheckCircleIcon, tile: "bg-success/15 text-success" },
  warning: { glyph: WarningIcon, tile: "bg-golden-harvest/45 text-nox-noir" },
};

export interface ModalIconProps {
  /** Replaces the tone's default glyph, e.g. `TrashIcon` for a delete. */
  icon?: Icon;
  tone: ModalTone;
}

/**
 * The tinted icon tile at the top-left of every {@link Modal}: a `size-10`
 * `rounded-field` square in the tone's colour, so the user reads the kind of
 * message (done, heads-up, destructive) before the words.
 */
export const ModalIcon = ({ icon, tone }: ModalIconProps) => {
  const { glyph: Glyph, tile } = toneStyles[tone];
  const IconGlyph = icon ?? Glyph;

  return (
    <span
      aria-hidden
      className={cn(
        "modal-icon grid size-10 shrink-0 place-items-center rounded-field",
        tile,
      )}
    >
      <IconGlyph
        size={iconSize.tile}
        weight="bold"
      />
    </span>
  );
};

export default ModalIcon;
