import { QuotesIcon } from "@phosphor-icons/react/dist/ssr";

import { TestimonialAvatar } from "@/components/website/testimonial-avatar/testimonial-avatar";
import { cn } from "@/lib/utils";

export interface TestimonialQuoteProps {
  /** Background token for the panel, e.g. `bg-play-teal`. */
  accent: string;
  className?: string;
  isActive: boolean;
  name: string;
  quote: string;
  role: string;
}

export const TestimonialQuote = ({
  accent,
  className,
  isActive,
  name,
  quote,
  role,
}: TestimonialQuoteProps) => {
  return (
    <figure
      aria-hidden={!isActive}
      className={cn(
        "testimonial-quote col-start-1 row-start-1 flex flex-col rounded-box p-8 text-nox-noir transition-[opacity,translate] duration-500 motion-reduce:transition-none sm:p-12",
        accent,
        isActive
          ? "translate-y-0 opacity-100"
          : "invisible translate-y-3 opacity-0",
        className,
      )}
    >
      <QuotesIcon
        aria-hidden
        size={48}
        weight="fill"
      />
      <blockquote className="mt-8 font-title text-2xl font-bold leading-snug sm:text-3xl lg:text-4xl">
        {quote}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-4 pt-10">
        <TestimonialAvatar
          accent="bg-white"
          name={name}
          size="lg"
        />
        <span>
          <span className="block font-title text-lg font-bold">{name}</span>
          <span className="block text-base text-nox-noir/70">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
};
