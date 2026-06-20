import { ArrowUpRightIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type DashboardDestinationCardTone = "blue" | "golden" | "pink" | "purple" | "teal";

export interface DashboardDestinationCardProps {
  description: string;
  href: string;
  icon: Icon;
  label: string;
  metric: string;
  tone: DashboardDestinationCardTone;
}

const toneClasses: Record<
  DashboardDestinationCardTone,
  {
    card: string;
    icon: string;
    metric: string;
  }
> = {
  blue: {
    card: "border-play-blue bg-play-blue/50 hover:bg-play-blue/65",
    icon: "bg-nox-noir text-play-blue",
    metric: "bg-white/70 text-nox-noir",
  },
  golden: {
    card: "border-golden-harvest bg-golden-harvest hover:brightness-95",
    icon: "bg-nox-noir text-golden-harvest",
    metric: "bg-white/65 text-nox-noir",
  },
  pink: {
    card: "border-play-pink bg-play-pink/65 hover:bg-play-pink/80",
    icon: "bg-nox-noir text-play-pink",
    metric: "bg-white/70 text-nox-noir",
  },
  purple: {
    card: "border-play-purple bg-play-purple/65 hover:bg-play-purple/80",
    icon: "bg-nox-noir text-play-purple",
    metric: "bg-white/70 text-nox-noir",
  },
  teal: {
    card: "border-play-teal bg-play-teal/55 hover:bg-play-teal/70",
    icon: "bg-nox-noir text-play-teal",
    metric: "bg-white/70 text-nox-noir",
  },
};

export const DashboardDestinationCard = ({
  description,
  href,
  icon: DestinationIcon,
  label,
  metric,
  tone,
}: DashboardDestinationCardProps) => {
  const style = toneClasses[tone];

  return (
    <Link
      className={cn(
        "group flex min-h-44 flex-col justify-between rounded-box border p-5 transition duration-200 hover:-translate-y-0.5",
        style.card,
      )}
      href={href}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex size-11 items-center justify-center rounded-box", style.icon)}>
          <DestinationIcon aria-hidden size={23} weight="bold" />
        </span>
        <ArrowUpRightIcon
          aria-hidden
          className="text-nox-noir/45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-nox-noir"
          size={20}
          weight="bold"
        />
      </div>

      <div>
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 font-title text-xs font-bold uppercase tracking-normal",
            style.metric,
          )}
        >
          {metric}
        </span>
        <h3 className="mt-3 font-title text-xl font-bold text-nox-noir">{label}</h3>
        <p className="mt-1 text-sm leading-6 text-nox-noir/70">{description}</p>
      </div>
    </Link>
  );
};
