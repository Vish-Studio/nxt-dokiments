import { cn } from "@/lib/utils";

interface Props {
  barFillClassName: string;
  barTrackClassName: string;
  isCompact: boolean;
  level: number;
  name: string;
}

export const CvSkillBar = ({
  barFillClassName,
  barTrackClassName,
  isCompact,
  level,
  name,
}: Props) => (
  <li className="cv-skill-bar min-w-0">
    <p
      className={cn(
        "break-words font-medium text-nox-noir",
        isCompact ? "text-xs" : "text-sm",
      )}
    >
      {name}
    </p>
    <div
      aria-label={`${name}: ${level}%`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={level}
      className={cn(
        "mt-1 w-full overflow-hidden rounded-full",
        barTrackClassName,
      )}
      role="meter"
    >
      <div
        className={cn("h-full rounded-full", barFillClassName)}
        style={{ width: `${level}%` }}
      />
    </div>
  </li>
);

export default CvSkillBar;
