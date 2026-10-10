import type { BadgeVariant } from "@/components/commons/badge/badge";
import { Badge } from "@/components/commons/badge/badge";
import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export interface StyleShowcaseCardProps {
  /** Background token for the stage behind the document, e.g. `bg-play-teal`. */
  accent: string;
  className?: string;
  description: string;
  name: string;
  onPreview: () => void;
  template: MarketplaceTemplate;
  tierLabel: string;
  tierVariant: BadgeVariant;
}

export const StyleShowcaseCard = ({
  accent,
  className,
  description,
  name,
  onPreview,
  template,
  tierLabel,
  tierVariant,
}: StyleShowcaseCardProps) => {
  return (
    <button
      aria-label={`Preview the ${name} style: ${template.name}`}
      className={cn(
        "style-showcase-card website-card-reveal group flex w-full flex-col rounded-box border border-steel-mist bg-white p-3 text-left transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-nox-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
      onClick={onPreview}
      type="button"
    >
      <span
        className={cn(
          "relative block aspect-4/5 w-full overflow-hidden rounded-box",
          accent,
        )}
      >
        <span className="absolute inset-x-6 top-8 block transition-[translate] duration-500 ease-out group-hover:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          <TemplateThumbnail template={template} />
        </span>
      </span>

      <span className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <span className="flex items-center justify-between gap-3">
          <span className="font-title text-2xl font-bold text-nox-noir">
            {name}
          </span>
          <Badge variant={tierVariant}>{tierLabel}</Badge>
        </span>
        <span className="mt-2 block text-sm leading-6 text-nox-noir/70">
          {description}
        </span>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 font-title font-bold text-nox-noir">
          Preview a sample
          <span className="arrow-cta-icon">
            <ArrowRight
              aria-hidden
              size={18}
              weight="bold"
            />
          </span>
        </span>
      </span>
    </button>
  );
};
