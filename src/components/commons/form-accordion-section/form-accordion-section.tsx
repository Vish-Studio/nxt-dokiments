import { CaretDownIcon, CheckCircleIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Button } from "@/components/commons/button/button";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  icon: Icon;
  id: string;
  isComplete?: boolean;
  isLast?: boolean;
  isOpen: boolean;
  onNext: () => void;
  onToggle: () => void;
  title: string;
}

export const FormAccordionSection = ({
  children,
  icon: SectionIcon,
  id,
  isComplete = false,
  isLast = false,
  isOpen,
  onNext,
  onToggle,
  title,
}: Props) => {
  const panelId = `form-section-${id}`;

  return (
    <fieldset className="form-accordion-section min-w-0 border-0 border-t border-steel-mist/60 pt-4 first:border-t-0 first:pt-0">
      <legend className="float-left w-full">
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-2 py-1 text-left font-title text-base font-bold text-nox-noir"
          onClick={onToggle}
          type="button"
        >
          <SectionIcon
            aria-hidden
            className="size-5 shrink-0"
          />
          <span className="flex-1">{title}</span>
          {isComplete && !isOpen ? (
            <CheckCircleIcon
              aria-label="Completed"
              className="size-5 shrink-0 text-success"
              weight="fill"
            />
          ) : null}
          <CaretDownIcon
            aria-hidden
            className={cn(
              "size-4 shrink-0 transition-transform",
              isOpen && "rotate-180",
            )}
            weight="bold"
          />
        </button>
      </legend>
      <div
        className={cn(
          "clear-both grid min-w-0 gap-4 pt-5",
          !isOpen && "hidden",
        )}
        id={panelId}
      >
        {children}
        <div className="flex justify-end">
          <Button
            onClick={onNext}
            size="sm"
            variant="primary"
          >
            {isLast ? "Save" : "Next"}
          </Button>
        </div>
      </div>
    </fieldset>
  );
};

export default FormAccordionSection;
