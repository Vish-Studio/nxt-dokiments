import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SettingsCardProps {
  /** Right-aligned control in the header, e.g. an Edit button. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  /** Shown in a tile beside the title, tinted with `tone`. */
  icon?: Icon;
  title: string;
  tone?: SettingsCardTone;
}

export type SettingsCardTone = "blue" | "golden" | "pink" | "purple" | "teal";

const toneClasses: Record<SettingsCardTone, string> = {
  blue: "bg-play-blue",
  golden: "bg-golden-harvest",
  pink: "bg-play-pink",
  purple: "bg-play-purple",
  teal: "bg-play-teal",
};

/**
 * One bordered block of a Settings section: a title row (with an optional tinted
 * icon tile) and an optional action on the right, then the block's content. Every Settings card shares this chrome
 * so the sections read as one page.
 */
export const SettingsCard = ({
  action,
  children,
  className,
  description,
  icon: CardIcon,
  title,
  tone = "golden",
}: SettingsCardProps) => (
  <section
    className={cn(
      "settings-card rounded-box border border-steel-mist bg-base-100 p-6",
      className,
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-4">
        {CardIcon ? (
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-field text-nox-noir",
              toneClasses[tone],
            )}
          >
            <CardIcon
              aria-hidden
              size={20}
              weight="bold"
            />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="font-title text-lg font-bold text-nox-noir">{title}</h3>
          {description ? (
            <div className="mt-1 text-sm leading-6 text-nox-noir/60">
              {description}
            </div>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
    <div className="mt-6">{children}</div>
  </section>
);

export default SettingsCard;
