import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import type { AnalyticsTrigger } from "@/lib/analytics/events";
import { toAnalyticsAttributes } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "neutral"
  | "ghost"
  | "outline"
  | "danger"
  | "danger-outline";
type ButtonSize = "sm" | "md" | "lg";
type ButtonIconMotion = "left" | "right" | "up-right";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  analytics?: AnalyticsTrigger;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconMotion?: ButtonIconMotion;
  iconPosition?: "left" | "right";
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "btn-primary hover:bg-steel-mist border-steel-mist hover:text-nox-noir",
  accent:
    "border border-transparent bg-golden-harvest text-nox-noir hover:brightness-95",
  secondary:
    "border border-transparent bg-base-200 text-nox-noir hover:bg-base-300",
  neutral: "btn-neutral",
  ghost: "btn-ghost",
  outline:
    "border border-steel-mist bg-transparent text-nox-noir hover:bg-base-200",
  danger: "btn-error",
  // A delete beside a main action: red, but quieter than the solid `danger`.
  "danger-outline":
    "border border-error/50 bg-transparent text-error hover:border-error hover:bg-error/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm min-h-10 h-10 px-4 text-sm",
  md: "min-h-11 h-11 px-5 text-sm",
  lg: "btn-lg min-h-12 h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      analytics,
      children,
      className,
      variant = "primary",
      size = "md",
      icon,
      iconMotion,
      iconPosition = "right",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const renderedIcon = icon ? (
      <span
        className={cn(iconMotion ? "button-arrow-icon" : null)}
        data-direction={iconMotion}
      >
        {icon}
      </span>
    ) : null;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "btn group rounded-field font-title transition-all duration-200",
          // Accent is a page's main action: bold, like the accent LinkButton
          // ("Browse marketplace"), so the two read as the same button.
          variant === "accent" ? "font-bold" : "font-semibold",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...toAnalyticsAttributes(analytics)}
        {...props}
      >
        {iconPosition === "left" ? renderedIcon : null}
        {children}
        {iconPosition === "right" ? renderedIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";
