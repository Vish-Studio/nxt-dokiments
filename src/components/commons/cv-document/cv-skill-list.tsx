import { cn } from "@/lib/utils";

interface Props {
  chipClassName: string;
  isCompact: boolean;
  names: string[];
}

export const CvSkillList = ({ chipClassName, isCompact, names }: Props) => (
  <ul className="cv-skill-list flex flex-wrap gap-2">
    {names.map((name, index) => (
      <li
        className={cn(
          "break-words font-medium",
          chipClassName,
          isCompact ? "text-xs" : "text-sm",
        )}
        key={index}
      >
        {name}
      </li>
    ))}
  </ul>
);

export default CvSkillList;
