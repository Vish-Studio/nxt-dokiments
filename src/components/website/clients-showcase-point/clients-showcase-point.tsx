import type { Icon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface Props {
  /** Background token for the icon tile, e.g. `bg-play-blue`. */
  accent: string;
  description: string;
  icon: Icon;
  title: string;
}

export const ClientsShowcasePoint = ({
  accent,
  description,
  icon: PointIcon,
  title,
}: Props) => {
  return (
    <li className="clients-showcase-point website-card-reveal flex gap-4">
      <span
        aria-hidden
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-field text-nox-noir",
          accent,
        )}
      >
        <PointIcon
          size={22}
          weight="bold"
        />
      </span>
      <div>
        <h3 className="font-title text-xl font-bold text-nox-noir">{title}</h3>
        <p className="mt-1 text-base leading-7 text-nox-noir/70">
          {description}
        </p>
      </div>
    </li>
  );
};

export default ClientsShowcasePoint;
