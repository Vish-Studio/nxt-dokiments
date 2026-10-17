"use client";

import { CaretDownIcon, GiftIcon } from "@phosphor-icons/react";
import type { ReactNode, SyntheticEvent } from "react";

import { activePromoCode } from "@/lib/promo/promo-codes";
import { cn } from "@/lib/utils";

export interface PromoCodeDisclosureProps {
  /** The promo field itself; the owning form keeps its state and wiring. */
  children: ReactNode;
  className?: string;
  /** The code currently entered, summarised in the toggle while collapsed. */
  value?: string;
}

/**
 * Tucks the optional promo field behind a "Have a promo code?" toggle so the
 * credentials and their submit button read as one unit.
 *
 * A native `<details>` keeps the field mounted while collapsed, so its value
 * still travels with the form and the Google link either way. Opening it moves
 * focus straight into the field.
 */
export const PromoCodeDisclosure = ({
  children,
  className,
  value,
}: PromoCodeDisclosureProps) => {
  const enteredCode = value?.trim();

  const handleToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    if (!event.currentTarget.open) return;
    event.currentTarget.querySelector("input")?.focus();
  };

  return (
    <details
      className={cn("promo-code-disclosure group", className)}
      onToggle={handleToggle}
    >
      <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-field px-2 py-1 font-title text-sm font-semibold text-nox-noir/70 transition-colors hover:text-nox-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir [&::-webkit-details-marker]:hidden">
        <GiftIcon aria-hidden size={16} weight="fill" />
        {enteredCode ? (
          <span className="group-open:hidden">
            Promo code{" "}
            <span className="font-bold text-nox-noir">{enteredCode}</span>
          </span>
        ) : null}
        <span className={enteredCode ? "hidden group-open:inline" : undefined}>
          Have a promo code?
        </span>
        <CaretDownIcon
          aria-hidden
          className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
          size={14}
          weight="bold"
        />
      </summary>

      {/* Same golden box as `PromoCodeCallout`, with the field inside it. */}
      <div className="mt-4 grid gap-4 rounded-box border border-golden-harvest/40 bg-golden-harvest/10 p-4">
        <div className="flex items-start gap-3">
          <GiftIcon
            aria-hidden
            className="mt-0.5 shrink-0 text-nox-noir"
            size={20}
            weight="fill"
          />
          <div className="min-w-0">
            <p className="font-title text-sm font-bold text-nox-noir">
              {activePromoCode.label}
            </p>
            <p className="mt-1 text-sm leading-6 text-nox-noir/70">
              Use promo code{" "}
              <span className="font-title font-bold text-nox-noir">
                {activePromoCode.code}
              </span>{" "}
              to unlock the current launch offer.
            </p>
          </div>
        </div>
        {children}
      </div>
    </details>
  );
};
