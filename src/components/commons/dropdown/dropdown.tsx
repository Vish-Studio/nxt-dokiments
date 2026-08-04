"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type DropdownProps = {
  ariaLabel: string;
  children: ReactNode;
  trigger: ReactNode;
  align?: "start" | "end";
  buttonClassName?: string;
  className?: string;
  menuClassName?: string;
};

export const Dropdown = ({
  align = "end",
  ariaLabel,
  buttonClassName,
  children,
  className,
  menuClassName,
  trigger,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        "dropdown",
        align === "end" ? "dropdown-end" : "dropdown-start",
        isOpen && "dropdown-open",
        className,
      )}
      ref={dropdownRef}
    >
      <button
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={buttonClassName}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        {trigger}
      </button>
      {isOpen ? (
        <div className={cn("dropdown-content z-10", menuClassName)}>{children}</div>
      ) : null}
    </div>
  );
};
