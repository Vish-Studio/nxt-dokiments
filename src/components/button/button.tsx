import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "neutral" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary:
    "border border-transparent bg-base-200 text-nox-noir hover:bg-base-300",
  neutral: "btn-neutral",
  ghost: "btn-ghost",
  outline:
    "border border-steel-mist bg-transparent text-nox-noir hover:border-bloodwood-deep hover:bg-base-200 hover:text-bloodwood-deep",
  danger: "btn-error",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
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
          "btn font-title font-semibold tracking-normal",
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
