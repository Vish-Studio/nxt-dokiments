import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

export interface FaqItemProps {
  answer: string;
  className?: string;
  defaultOpen?: boolean;
  question: string;
}

export const FaqItem = ({
  answer,
  className,
  defaultOpen = false,
  question,
}: FaqItemProps) => {
  return (
    <details
      className={cn("faq-item group border-b border-steel-mist", className)}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-title text-xl font-bold text-nox-noir marker:content-none">
        <span>{question}</span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-field border border-steel-mist text-nox-noir transition-colors group-open:border-nox-noir group-open:bg-nox-noir group-open:text-white">
          <Plus
            aria-hidden
            className="group-open:hidden"
            size={16}
            weight="bold"
          />
          <Minus
            aria-hidden
            className="hidden group-open:block"
            size={16}
            weight="bold"
          />
        </span>
      </summary>
      <p className="max-w-2xl pb-6 text-base leading-7 text-nox-noir/70">
        {answer}
      </p>
    </details>
  );
};
