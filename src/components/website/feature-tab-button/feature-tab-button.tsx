import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface FeatureTabButtonProps {
  /** Background token of the page this tab links to, e.g. `bg-play-blue` for clients. */
  accent: string;
  description: string;
  href: string;
  id: string;
  isActive: boolean;
  linkLabel: string;
  onSelect: () => void;
  /** Fires when the active tab's autoplay progress bar completes. */
  onProgressEnd?: () => void;
  step: number;
  title: string;
}

export const FeatureTabButton = ({
  accent,
  description,
  href,
  id,
  isActive,
  linkLabel,
  onSelect,
  onProgressEnd,
  step,
  title,
}: FeatureTabButtonProps) => {
  const detailsId = `feature-tab-details-${id}`;

  return (
    <li
      className={cn(
        "feature-tab-button relative overflow-hidden rounded-box border transition-colors motion-reduce:transition-none",
        isActive
          ? "border-steel-mist bg-white p-6"
          : "border-transparent px-6 py-3 hover:bg-white/60",
      )}
    >
      <button
        aria-controls={isActive ? detailsId : undefined}
        aria-expanded={isActive}
        className={cn(
          "flex w-full items-baseline gap-4 text-left font-title text-xl font-bold transition-colors motion-reduce:transition-none sm:text-2xl",
          isActive ? "text-nox-noir" : "text-nox-noir/45 hover:text-nox-noir",
        )}
        onClick={onSelect}
        type="button"
      >
        <span
          aria-hidden
          className="w-6 shrink-0 text-center text-sm tabular-nums"
        >
          {String(step).padStart(2, "0")}
        </span>
        {title}
      </button>

      {isActive ? (
        <div
          className="feature-tab-details-enter pl-10 pt-3"
          id={detailsId}
        >
          <p className="text-base leading-7 text-nox-noir/70 sm:text-lg sm:leading-8">{description}</p>
          <Link
            className={cn(
              "mt-5 inline-flex h-10 items-center gap-2 rounded-field px-4 font-title text-sm font-bold text-nox-noir transition-[filter] hover:brightness-95",
              accent,
            )}
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

      {isActive ? (
        <span
          aria-hidden
          // Centred under the number: p-6 inset + half of the w-6 (text-centred) number − half the bar width.
          className="absolute bottom-6 left-8.75 top-16 w-0.5 overflow-hidden rounded-full bg-steel-mist/60"
        >
          <span
            className="feature-tab-progress block size-full bg-nox-noir/50"
            onAnimationEnd={onProgressEnd}
          />
        </span>
      ) : null}
    </li>
  );
};
