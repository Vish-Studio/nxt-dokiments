import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "accent" | "secondary" | "neutral" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary hover:bg-steel-mist border-steel-mist hover:text-nox-noir",
  accent: "border border-transparent bg-golden-harvest text-nox-noir hover:brightness-95",
  secondary:
    "border border-transparent bg-base-200 text-nox-noir hover:bg-base-300",
  neutral: "btn-neutral",
  ghost: "btn-ghost",
  outline: "border border-steel-mist bg-transparent text-nox-noir hover:bg-base-200",
  danger: "btn-error",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm min-h-10 h-10 px-4 text-sm",
  md: "min-h-11 h-11 px-5 text-sm",
  lg: "btn-lg min-h-12 h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "right",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const renderedIcon = icon ?? null;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "btn font-title font-semibold transition-all duration-200",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
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
