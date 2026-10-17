import {
  ArrowRight,
  BookmarkSimple,
  FilePdf,
  UserCheck,
} from "@phosphor-icons/react/dist/ssr";
import { Fragment } from "react";

import { HeroPill } from "@/components/website/hero-pill/hero-pill";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

// Page tones: templates pink, clients blue, finished documents golden.
const steps = [
  { accent: "bg-play-pink", icon: BookmarkSimple, label: "Template saved" },
  { accent: "bg-play-blue", icon: UserCheck, label: "Client prefilled" },
  { accent: "bg-golden-harvest", icon: FilePdf, label: "PDF ready" },
];

// The template → client → PDF flow as one slim strip; arrows follow the parent text colour.
export const HeroFlowSteps = ({ className }: Props) => {
  return (
    <div
      aria-hidden
      className={cn("hero-flow-steps flex items-center gap-2", className)}
    >
      {steps.map((step, index) => (
        <Fragment key={step.label}>
          {index > 0 ? (
            <ArrowRight
              className="hidden shrink-0 opacity-50 sm:block"
              size={14}
              weight="bold"
            />
          ) : null}
          <HeroPill
            accent={step.accent}
            icon={step.icon}
            label={step.label}
          />
        </Fragment>
      ))}
    </div>
  );
};

export default HeroFlowSteps;
