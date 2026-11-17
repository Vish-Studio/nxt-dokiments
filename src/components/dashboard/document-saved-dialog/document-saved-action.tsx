"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useId } from "react";

import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type DocumentSavedActionTone = "purple" | "teal";

export interface DocumentSavedActionProps {
  /** One short line under the label saying what happens. */
  description: string;
  icon: Icon;
  /** The action's accessible name, e.g. "Share". */
  label: string;
  onClick: () => void;
  /** Page-banner tone of the card, as on the dashboard destination cards. */
  tone: DocumentSavedActionTone;
}

const toneClasses: Record<
  DocumentSavedActionTone,
  { card: string; icon: string }
> = {
  purple: {
    card: "border-play-purple bg-play-purple/65 hover:bg-play-purple/85",
    icon: "bg-nox-noir text-play-purple",
  },
  teal: {
    card: "border-play-teal bg-play-teal/55 hover:bg-play-teal/75",
    icon: "bg-nox-noir text-play-teal",
  },
};

/**
 * One next-step card in {@link DocumentSavedDialog}, styled like the dashboard
 * destination cards: a tinted card, a noir icon tile and an arrow that nudges on
 * hover. The button is named by `label` alone and described by `description`,
 * so "Share" stays a short, predictable name for assistive tech and tests.
 */
export const DocumentSavedAction = ({
  description,
  icon: ActionIcon,
  label,
  onClick,
  tone,
}: DocumentSavedActionProps) => {
  const labelId = useId();
  const descriptionId = useId();
  const style = toneClasses[tone];

  return (
    <button
      aria-describedby={descriptionId}
      aria-labelledby={labelId}
      className={cn(
        "document-saved-action group flex flex-col gap-4 rounded-box border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir",
        style.card,
      )}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-field",
            style.icon,
          )}
        >
          <ActionIcon
            aria-hidden
            size={iconSize.tile}
            weight="bold"
          />
        </span>
        <ArrowUpRightIcon
          aria-hidden
          className="text-nox-noir/45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-nox-noir motion-reduce:transition-none"
          size={iconSize.control}
          weight="bold"
        />
      </span>
      <span>
        <span
          className="block font-title text-base font-bold text-nox-noir"
          id={labelId}
        >
          {label}
        </span>
        <span
          className="mt-0.5 block text-xs leading-5 text-nox-noir/70"
          id={descriptionId}
        >
          {description}
        </span>
      </span>
    </button>
  );
};

export default DocumentSavedAction;
