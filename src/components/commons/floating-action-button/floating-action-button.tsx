import type { ReactNode } from "react";

import { Button } from "@/components/commons/button/button";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";

export interface FloatingActionButtonProps {
  className?: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export const FloatingActionButton = ({
  className,
  icon,
  label,
  onClick,
}: FloatingActionButtonProps) => {
  return (
    <div
      className={cn(
        "floating-action-button fixed bottom-20 right-5 z-50 sm:bottom-6 sm:right-6",
        className,
      )}
    >
      <ButtonIcon
        aria-label={label}
        className="shadow-none sm:hidden"
        icon={icon}
        onClick={onClick}
        size="lg"
        variant="accent"
      />
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
    </div>
  );
};
