import { cn } from "@/lib/utils";

interface Props {
  description?: string;
  isCompact: boolean;
  periodClassName: string;
  period?: string;
  subtitle?: string;
  title: string;
}

export const CvTimelineItem = ({
  description,
  isCompact,
  period,
  periodClassName,
  subtitle,
  title,
}: Props) => (
  <li className="cv-timeline-item min-w-0 break-words">
    {period ? (
      <p className={cn(periodClassName, isCompact && "text-[10px]!")}>
        {period}
      </p>
    ) : null}
    <p
      className={cn(
        "font-semibold text-nox-noir",
        isCompact ? "text-xs" : "text-sm",
      )}
    >
      {title}
    </p>
    {subtitle ? (
      <p className={cn("text-nox-noir/60", isCompact ? "text-xs" : "text-sm")}>
        {subtitle}
      </p>
    ) : null}
    {description ? (
      <p
        className={cn(
          "mt-1 whitespace-pre-line text-nox-noir/80",
          isCompact ? "text-xs leading-5" : "text-sm leading-6",
        )}
      >
        {description}
      </p>
    ) : null}
  </li>
);

export default CvTimelineItem;
