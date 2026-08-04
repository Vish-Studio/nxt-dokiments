import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type LinkButtonVariant = "primary" | "accent" | "outline" | "outlineDark" | "ghostDark";
type LinkButtonSize = "sm" | "md" | "lg";

export interface LinkButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  children: ReactNode;
  href: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  size?: LinkButtonSize;
  variant?: LinkButtonVariant;
}

const variantClasses: Record<LinkButtonVariant, string> = {
  accent: "border-transparent bg-golden-harvest text-nox-noir hover:brightness-95",
  ghostDark: "border-transparent bg-transparent text-white hover:bg-white/10",
  outline: "border-steel-mist bg-transparent text-nox-noir hover:bg-base-200",
  outlineDark: "border-white/18 bg-transparent text-white hover:bg-white/10",
  primary: "border-transparent bg-nox-noir text-white hover:brightness-110",
};

const sizeClasses: Record<LinkButtonSize, string> = {
  lg: "min-h-12 px-6 py-4 text-base",
  md: "min-h-11 px-5 py-3 text-sm",
  sm: "min-h-10 px-4 py-2 text-sm",
};

export const LinkButton = ({
  children,
  className,
  href,
  icon,
  iconPosition = "right",
  size = "md",
  variant = "primary",
  ...props
}: LinkButtonProps) => {
  const renderedIcon = icon ?? <ArrowRight aria-hidden size={18} weight="bold" />;

  return (
    <Link
      className={cn(
        "link-button inline-flex items-center justify-center gap-2 rounded-box border font-title font-bold transition",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      href={href}
      {...props}
    >
      {iconPosition === "left" ? renderedIcon : null}
      {children}
      {iconPosition === "right" ? renderedIcon : null}
    </Link>
  );
};
