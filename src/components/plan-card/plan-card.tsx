import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type PlanCardVariant = "default" | "featured" | "accent";

export type PlanCardAction = {
  disabled?: boolean;
  href?: string;
  label: string;
  onClick?: () => void;
};

export type PlanCardProps = {
  action: PlanCardAction;
  badge?: string;
  className?: string;
  description: string;
  features: string[];
  name: string;
  period?: string;
  price: string;
  style?: CSSProperties;
  variant?: PlanCardVariant;
};

type VariantStyle = {
  badge: string;
  card: string;
  check: string;
  cta: string;
  muted: string;
};

const variantStyles: Record<PlanCardVariant, VariantStyle> = {
  default: {
    badge: "bg-bloodwood-deep text-white",
    card: "border-steel-mist bg-base-100 text-nox-noir",
    check: "text-bloodwood-deep",
    cta: "bg-bloodwood-deep text-white hover:bg-nox-noir",
    muted: "text-nox-noir/60",
  },
  featured: {
    badge: "bg-golden-harvest text-bloodwood-deep",
    card: "border-bloodwood-deep bg-bloodwood-deep text-white",
    check: "text-golden-harvest",
    cta: "bg-golden-harvest text-bloodwood-deep hover:brightness-105",
    muted: "text-white/70",
  },
  accent: {
    badge: "bg-bloodwood-deep text-golden-harvest",
    card: "border-golden-harvest bg-golden-harvest text-bloodwood-deep",
    check: "text-bloodwood-deep",
    cta: "bg-bloodwood-deep text-golden-harvest hover:bg-nox-noir",
    muted: "text-bloodwood-deep/70",
  },
};

export const PlanCard = ({
  action,
  badge,
  className,
  description,
  features,
  name,
  period,
  price,
  style,
  variant = "default",
}: PlanCardProps) => {
  const styles = variantStyles[variant];

  const ctaClassName = cn(
    "mt-auto inline-flex w-full items-center justify-center rounded-field px-5 py-3 font-title text-sm font-bold transition disabled:cursor-default disabled:opacity-60",
    styles.cta,
  );

  return (
    <article className={cn("flex flex-col rounded-box border p-6", styles.card, className)} style={style}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-title text-lg font-bold">{name}</h3>
        {badge ? (
          <span
            className={cn(
              "inline-flex items-center rounded-field px-2.5 py-1 font-title text-xs font-bold",
              styles.badge,
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-4 font-title text-3xl font-bold">
        {price}
        {period ? <span className={cn("text-sm font-semibold", styles.muted)}>{period}</span> : null}
      </div>

      <p className={cn("mt-3 text-sm leading-6", styles.muted)}>{description}</p>

      <ul className="mt-6 mb-8 grid gap-3">
        {features.map((feature) => (
          <li className="flex items-center gap-2.5 text-sm" key={feature}>
            <CheckIcon aria-hidden className={cn("shrink-0", styles.check)} size={16} weight="bold" />
            {feature}
          </li>
        ))}
      </ul>

      {action.href ? (
        <Link className={ctaClassName} href={action.href}>
          {action.label}
        </Link>
      ) : (
        <button
          className={ctaClassName}
          disabled={action.disabled}
          onClick={action.onClick}
          type="button"
        >
          {action.label}
        </button>
      )}
    </article>
  );
};
