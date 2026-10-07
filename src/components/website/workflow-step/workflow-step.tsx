import { cn } from "@/lib/utils";

export interface WorkflowStepProps {
  /** Background token for the step marker, e.g. `bg-play-teal`. */
  accent: string;
  className?: string;
  description: string;
  isLast?: boolean;
  step: number;
  title: string;
}

export const WorkflowStep = ({
  accent,
  className,
  description,
  isLast = false,
  step,
  title,
}: WorkflowStepProps) => {
  return (
    <li className={cn("workflow-step website-card-reveal", className)}>
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-full font-title text-xl font-bold text-nox-noir",
            accent,
          )}
        >
          {String(step).padStart(2, "0")}
        </span>
        {isLast ? null : (
          <span
            aria-hidden
            className="hidden h-0.5 flex-1 bg-nox-noir/15 xl:-mr-8 xl:block"
          />
        )}
      </div>
      <h3 className="mt-6 font-title text-2xl font-bold leading-tight text-nox-noir">
        <span className="sr-only">Step {step}: </span>
        {title}
      </h3>
      <p className="mt-3 text-base leading-7 text-nox-noir/70">{description}</p>
    </li>
  );
};
