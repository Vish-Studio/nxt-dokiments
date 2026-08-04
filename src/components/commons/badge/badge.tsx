import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "accent"
  | "free"
  | "gold"
  | "neutral"
  | "noir"
  | "silver"
  | "special"
  | "success"
  | "superadmin";

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  accent: "bg-golden-harvest text-nox-noir",
  free: "bg-success text-success-content",
  gold: "bg-golden-harvest text-nox-noir ",
  neutral: "bg-base-200 text-nox-noir/65",
  noir: "bg-nox-noir text-white",
  silver: "bg-nox-noir text-white",
  special: "bg-play-purple text-nox-noir",
  success: "bg-success text-success-content",
  superadmin: "bg-nox-noir text-golden-harvest",
};

export const Badge = ({ children, className, icon, variant = "neutral" }: BadgeProps) => {
  return (
    <span
      className={cn(
        "badge inline-flex items-center gap-1 rounded-field px-2.5 py-1 font-title text-xs font-semibold border-0",
        variantClasses[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
};
