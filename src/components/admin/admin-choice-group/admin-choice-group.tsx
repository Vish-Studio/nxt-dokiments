"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** One choice in an {@link AdminChoiceGroup}. */
export interface AdminChoiceOption<T extends string> {
  /** The accessible name, and the visible text for `chip` and `tile`. */
  label: string;
  value: T;
  /**
   * What the choice looks like: a colour class for `swatch` (`bg-play-blue`),
   * a picture for `tile`, or a small icon before the label for `chip`.
   */
  visual?: ReactNode;
}

export interface AdminChoiceGroupProps<T extends string> {
  /** Names the group, shown above it ("Colour"). */
  label: string;
  onChange: (value: T) => void;
  options: readonly AdminChoiceOption<T>[];
  value: T;
  /**
   * How each choice is drawn.
   * - `chip`: a small text button ("Gift").
   * - `swatch`: a round colour sample, named by its label.
   * - `tile`: a picture with its label underneath.
   */
  variant: "chip" | "swatch" | "tile";
}

/**
 * Pick one option by sight instead of from a dropdown: colours as swatches,
 * images as thumbnails, icons as chips.
 *
 * A real radio group (`role="radiogroup"` with `aria-checked` buttons), so it
 * reads correctly to a screen reader; the selected choice gets the app's dark
 * selection ring.
 */
export const AdminChoiceGroup = <T extends string>({
  label,
  onChange,
  options,
  value,
  variant,
}: AdminChoiceGroupProps<T>) => (
  <div className="admin-choice-group grid gap-2">
    <span className="font-title text-sm font-semibold text-nox-noir">{label}</span>
    <div
      aria-label={label}
      className={cn(
        variant === "tile" ? "grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2" : "flex flex-wrap gap-2",
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            aria-checked={isSelected}
            aria-label={variant === "swatch" ? option.label : undefined}
            className={cn(
              "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir",
              variant === "chip" &&
                "inline-flex h-10 items-center gap-2 rounded-field border px-3 font-title text-sm font-semibold text-nox-noir hover:bg-base-200",
              variant === "chip" && (isSelected ? "border-2 border-nox-noir bg-base-200" : "border-steel-mist bg-base-100"),
              variant === "swatch" && "size-11 rounded-full shadow-[inset_0_0_0_3px_white]",
              variant === "swatch" && (isSelected ? "ring-3 ring-nox-noir" : "ring-1 ring-steel-mist"),
              variant === "tile" &&
                "grid gap-1.5 rounded-box border bg-base-100 p-1.5 text-left font-title text-xs font-semibold text-nox-noir hover:bg-base-200",
              variant === "tile" && (isSelected ? "border-2 border-nox-noir" : "border-steel-mist"),
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            role="radio"
            title={option.label}
            type="button"
          >
            {variant === "swatch" ? (
              <span
                aria-hidden
                className={cn("block size-full rounded-full", option.visual as string)}
              />
            ) : null}
            {variant === "tile" ? (
              <>
                <span className="block h-16 overflow-hidden rounded-field bg-base-200">{option.visual}</span>
                <span className="px-1">{option.label}</span>
              </>
            ) : null}
            {variant === "chip" ? (
              <>
                {option.visual}
                {option.label}
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  </div>
);

export default AdminChoiceGroup;
