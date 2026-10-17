import { cn } from "@/lib/utils";

export interface WorkflowStepProps {
  /** Background token for the step marker, e.g. `bg-play-teal`. */
  accent: string;
  className?: string;
  description: string;
  isFirst?: boolean;
  isLast?: boolean;
  step: number;
  title: string;
}

export const WorkflowStep = ({
  accent,
  className,
  description,
  isFirst = false,
  isLast = false,
  step,
  title,
}: WorkflowStepProps) => {
  return (
    <li className={cn("workflow-step website-card-reveal text-center", className)}>
      {/* On xl the connector is drawn in halves: this marker to the column gap, and the gap to the next marker. */}
      <div className="relative flex justify-center">
        {isFirst ? null : (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 right-1/2 my-auto hidden h-0.5 bg-white/25 xl:block"
          />
        )}
        {isLast ? null : (
          <span
            aria-hidden
            className="absolute inset-y-0 left-1/2 -right-8 my-auto hidden h-0.5 bg-white/25 xl:block"
          />
        )}
        <span
          aria-hidden
          className={cn(
            "relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full font-title text-xl font-bold text-nox-noir ring-8 ring-nox-noir",
            accent,
          )}
        >
          {String(step).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-6 font-title text-2xl font-bold leading-tight text-white">
        <span className="sr-only">Step {step}: </span>
        {title}
      </h3>
      <p className="mt-3 text-base leading-7 text-white/70">{description}</p>
    </li>
  );
};
