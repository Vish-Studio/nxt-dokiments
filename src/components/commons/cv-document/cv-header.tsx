import { cn } from "@/lib/utils";

import { CvAvatarPlaceholder } from "./cv-avatar-placeholder";
import { CvContactList } from "./cv-contact-list";
import type { CvStyleConfig } from "./cv-style-config";

interface Props {
  config: CvStyleConfig;
  isCompact: boolean;
  namePlaceholder?: string;
  titlePlaceholder?: string;
  values: Record<string, string>;
}

export const CvHeader = ({
  config,
  isCompact,
  namePlaceholder = "Your full name",
  titlePlaceholder = "Job title",
  values,
}: Props) => {
  const name = values.fullName?.trim();
  const jobTitle = values.jobTitle?.trim();

  return (
    <header
      className={cn("cv-header", config.header, isCompact && "px-5! py-4!")}
    >
      <div className={cn("flex items-center", isCompact ? "gap-3" : "gap-5")}>
        <CvAvatarPlaceholder
          className={config.avatar}
          isCompact={isCompact}
        />
        <div className="min-w-0 flex-1">
          <h2
            className={cn(
              config.name,
              !name && "italic opacity-40",
              isCompact && "text-xl!",
            )}
          >
            {name || namePlaceholder}
          </h2>
          <p
            className={cn(
              "mt-1",
              config.jobTitle,
              !jobTitle && "italic opacity-40",
              isCompact && "text-xs!",
            )}
          >
            {jobTitle || titlePlaceholder}
          </p>
          <CvContactList
            className={config.contact}
            isCompact={isCompact}
            values={values}
          />
        </div>
      </div>
    </header>
  );
};

export default CvHeader;
