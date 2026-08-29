import Link from "next/link";
import type { ReactNode } from "react";

import {
  ButtonIcon,
  buttonIconClasses,
} from "@/components/commons/button-icon/button-icon";
import { Button } from "@/components/commons/button/button";
import { cn } from "@/lib/utils";

/**
 * `"auto"` keeps the responsive default: a circle on mobile that grows into a
 * labelled pill from `sm` up. `"circle"` stays icon-only at every breakpoint —
 * for pages where the surrounding layout already names the action.
 */
type FloatingActionButtonShape = "auto" | "circle";

export type FloatingActionButtonProps = {
  className?: string;
  /**
   * Renders a `next/link` anchor instead of a button, and takes precedence over
   * `onClick`. The anchor form is always circular — `shape` governs the button
   * form only, since there is no pill anchor variant.
   */
  href?: string;
  icon: ReactNode;
  /** Visible text in `"auto"` shape; the accessible name in both shapes. */
  label: string;
  /** Required unless `href` is set. */
  onClick?: () => void;
  shape?: FloatingActionButtonShape;
};

export const FloatingActionButton = ({
  className,
  href,
  icon,
  label,
  onClick,
  shape = "auto",
}: FloatingActionButtonProps) => {
  return (
    <div
      className={cn(
        "floating-action-button fixed bottom-6 lg:bottom-10 right-5 z-50 sm:bottom-6 sm:right-10",
        className,
      )}
    >
      {href ? (
        // A navigating FAB is a real anchor, so middle-click, cmd-click and
        // Next.js prefetching all behave as users expect from a link.
        <Link
          aria-label={label}
          className={buttonIconClasses({
            className: "shadow-none",
            size: "lg",
            variant: "accent",
          })}
          href={href}
          title={label}
        >
          {icon}
        </Link>
      ) : (
        <>
          <ButtonIcon
            aria-label={label}
            className={cn("shadow-none", shape === "auto" ? "sm:hidden" : null)}
            icon={icon}
            onClick={onClick}
            size="lg"
            title={label}
            variant="accent"
          />
          {shape === "auto" ? (
            <Button
              className="hidden shadow-none sm:inline-flex"
              icon={icon}
              iconPosition="left"
              onClick={onClick}
              size="md"
              variant="accent"
            >
              {label}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
};
