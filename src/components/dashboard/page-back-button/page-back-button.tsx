import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { buttonIconClasses } from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";
import type { PageBack } from "@/stores/ui-store";

export interface PageBackButtonProps {
  back: PageBack;
  /** The header's control colours (same as the menu and settings buttons). */
  className?: string;
}

/**
 * The back arrow in the top bar of a sub-page (`PageBanner` on desktop,
 * `MobilePageHeader` on phones), sitting right before the page title. A link
 * when `back.href` is set, otherwise a button calling `back.onClick`. Named
 * "Back to {label}" for assistive tech.
 */
export const PageBackButton = ({ back, className }: PageBackButtonProps) => {
  const classes = cn(
    "page-back-button shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
    buttonIconClasses({
      className: cn("size-9! min-h-9!", className),
      size: "sm",
      variant: "ghost",
    }),
  );
  const icon = (
    <ArrowLeftIcon
      aria-hidden
      size={16}
      weight="bold"
    />
  );

  return back.href ? (
    <Link
      aria-label={`Back to ${back.label}`}
      className={classes}
      href={back.href}
      onClick={back.onClick}
    >
      {icon}
    </Link>
  ) : (
    <button
      aria-label={`Back to ${back.label}`}
      className={classes}
      onClick={back.onClick}
      type="button"
    >
      {icon}
    </button>
  );
};

export default PageBackButton;
