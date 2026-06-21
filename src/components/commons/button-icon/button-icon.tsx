import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonIconVariant =
  | "accent"
  | "primary"
  | "secondary"
  | "neutral"
  | "ghost"
  | "outline"
  | "danger";
type ButtonIconSize = "sm" | "md" | "lg";
type ButtonIconShape = "circle" | "square";

export type ButtonIconProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required: icon-only buttons must expose an accessible name. */
  "aria-label": string;
  icon: ReactNode;
  variant?: ButtonIconVariant;
  size?: ButtonIconSize;
  shape?: ButtonIconShape;
};

const variantClasses: Record<ButtonIconVariant, string> = {
  accent: "border border-transparent bg-golden-harvest text-nox-noir hover:brightness-95",
  primary: "btn-primary",
  secondary:
    "border border-transparent bg-base-200 text-nox-noir hover:bg-base-300",
  neutral: "btn-neutral",
  ghost: "btn-ghost",
  outline: "border border-steel-mist bg-transparent text-nox-noir hover:bg-base-200",
  danger: "btn-error",
};

const sizeClasses: Record<ButtonIconSize, string> = {
  sm: "btn-sm size-10 min-h-10",
  md: "size-11 min-h-11",
  lg: "btn-lg size-12 min-h-12",
};

const shapeClasses: Record<ButtonIconShape, string> = {
  circle: "btn-circle",
  square: "btn-square",
};

export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(
  (
    {
      className,
      icon,
      shape = "circle",
      size = "md",
      type = "button",
      variant = "ghost",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "btn",
          variantClasses[variant],
          sizeClasses[size],
          shapeClasses[shape],
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    );
  },
);

ButtonIcon.displayName = "ButtonIcon";
