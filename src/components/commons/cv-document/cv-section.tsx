import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  isCompact: boolean;
  sectionTitleClassName: string;
  title: string;
}

export const CvSection = ({
  children,
  isCompact,
  sectionTitleClassName,
  title,
}: Props) => (
  <section className="cv-section break-words">
    <h3 className={cn(sectionTitleClassName, isCompact && "text-xs!")}>
      {title}
    </h3>
    <div className="mt-3">{children}</div>
  </section>
);

export default CvSection;
