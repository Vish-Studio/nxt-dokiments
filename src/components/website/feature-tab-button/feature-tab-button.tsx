import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface FeatureTabButtonProps {
  description: string;
  href: string;
  id: string;
  isActive: boolean;
  linkLabel: string;
  onSelect: () => void;
  title: string;
}

export const FeatureTabButton = ({
  description,
  href,
  id,
  isActive,
  linkLabel,
  onSelect,
  title,
}: FeatureTabButtonProps) => {
  const detailsId = `feature-tab-details-${id}`;

  return (
    <li
      className={cn(
        "feature-tab-button group border-l-4 pl-6 transition-colors motion-reduce:transition-none",
        isActive
          ? "border-nox-noir"
          : "border-steel-mist hover:border-nox-noir/40",
      )}
    >
      <button
        aria-controls={isActive ? detailsId : undefined}
        aria-expanded={isActive}
        className={cn(
          "w-full py-2 text-left font-title text-2xl font-bold transition-colors motion-reduce:transition-none sm:text-3xl",
          isActive ? "text-nox-noir" : "text-nox-noir/45 hover:text-nox-noir",
        )}
        onClick={onSelect}
        type="button"
      >
        {title}
      </button>

      {isActive ? (
        <div
          className="feature-tab-details-enter pb-2 pt-2"
          id={detailsId}
        >
          <p className="text-lg leading-8 text-nox-noir/70">{description}</p>
          <Link
            className="mt-5 inline-flex items-center gap-2 font-title font-bold text-nox-noir underline-offset-4 hover:underline"
            href={href}
          >
            {linkLabel}
            <span className="arrow-cta-icon">
              <ArrowRight
                aria-hidden
                size={18}
                weight="bold"
              />
            </span>
          </Link>
        </div>
      ) : null}
    </li>
  );
};
