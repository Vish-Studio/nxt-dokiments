import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "neutral" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  neutral: "btn-neutral",
  ghost: "btn-ghost",
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
    const renderedIcon =
      icon === undefined ? <ArrowRight aria-hidden size={18} weight="bold" /> : icon;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "btn font-title tracking-normal",
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
