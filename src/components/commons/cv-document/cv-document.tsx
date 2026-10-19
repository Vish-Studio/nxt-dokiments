import { clampLevel, visibleCvRows } from "@/lib/market-place/cv-lists";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

import { CvHeader } from "./cv-header";
import { CvSection } from "./cv-section";
import { CvSkillBar } from "./cv-skill-bar";
import { CvSkillList } from "./cv-skill-list";
import { cvStyleConfig } from "./cv-style-config";
import { CvTimelineItem } from "./cv-timeline-item";

export interface CvDocumentProps {
  className?: string;
  density?: "default" | "compact";
  layout?: "print" | "responsive";
  template: MarketplaceTemplate;
  values?: Record<string, string>;
}

export const CvDocument = ({
  className,
  density = "default",
  layout = "responsive",
  template,
  values = {},
}: CvDocumentProps) => {
  const isCompact = density === "compact";
  const config = cvStyleConfig[template.style.id];
  const about = values.about?.trim();
  const experience = visibleCvRows("experience", values.experience ?? "");
  const education = visibleCvRows("education", values.education ?? "");
  const skills = visibleCvRows("skills", values.skills ?? "");
  const languages = visibleCvRows("languages", values.languages ?? "");
  const certificates = visibleCvRows("certificates", values.certificates ?? "");
  const additional = visibleCvRows("additional", values.additional ?? "");
  const additionalTitle = values.additionalTitle?.trim() || "Additional";
  const sectionProps = {
    isCompact,
    sectionTitleClassName: config.sectionTitle,
  };
  const emptyClassName = cn(
    "italic text-nox-noir/35",
    isCompact ? "text-xs" : "text-sm",
  );
  const bodyTextClassName = cn(
    "whitespace-pre-line text-nox-noir/80",
    isCompact ? "text-xs leading-5" : "text-sm leading-6",
  );

  const renderBars = (rows: typeof skills) => (
    <ul className="grid gap-3">
      {rows.map((row, index) => (
        <CvSkillBar
          barFillClassName={config.barFill}
          barTrackClassName={config.barTrack}
          isCompact={isCompact}
          key={index}
          level={clampLevel(row.level ?? "0")}
          name={row.name}
        />
      ))}
    </ul>
  );

  return (
    <article
      className={cn(
        "cv-document flex flex-col bg-white text-nox-noir",
        config.paper,
        className,
      )}
    >
      <CvHeader
        config={config}
        isCompact={isCompact}
        values={values}
      />
      <div
        className={cn(
          config.body,
          isCompact && "p-5!",
          "grid gap-8",
          layout === "print" ? "grid-cols-[3fr_2fr]" : "sm:grid-cols-[3fr_2fr]",
        )}
      >
        <div className="grid min-w-0 content-start gap-6">
          <CvSection
            title="About"
            {...sectionProps}
          >
            <p className={about ? bodyTextClassName : emptyClassName}>
              {about || "A short biography about you."}
            </p>
          </CvSection>
          <CvSection
            title="Experience"
            {...sectionProps}
          >
            {experience.length ? (
              <ul className="grid gap-4">
                {experience.map((row, index) => (
                  <CvTimelineItem
                    description={row.description?.trim()}
                    isCompact={isCompact}
                    key={index}
                    period={row.period?.trim()}
                    periodClassName={config.period}
                    subtitle={row.company?.trim()}
                    title={row.title?.trim() || "Role"}
                  />
                ))}
              </ul>
            ) : (
              <p className={emptyClassName}>Roles you have held.</p>
            )}
          </CvSection>
          {education.length ? (
            <CvSection
              title="Education"
              {...sectionProps}
            >
              <ul className="grid gap-4">
                {education.map((row, index) => (
                  <CvTimelineItem
                    isCompact={isCompact}
                    key={index}
                    period={row.period?.trim()}
                    periodClassName={config.period}
                    subtitle={row.institution?.trim()}
                    title={row.title?.trim() || "Qualification"}
                  />
                ))}
              </ul>
            </CvSection>
          ) : null}
          {additional.length ? (
            <CvSection
              title={additionalTitle}
              {...sectionProps}
            >
              <ul className="grid gap-4">
                {additional.map((row, index) => (
                  <CvTimelineItem
                    description={row.description?.trim()}
                    isCompact={isCompact}
                    key={index}
                    period={row.period?.trim()}
                    periodClassName={config.period}
                    subtitle={row.subtitle?.trim()}
                    title={row.title?.trim() || "Entry"}
                  />
                ))}
              </ul>
            </CvSection>
          ) : null}
        </div>
        <aside className="grid min-w-0 content-start gap-6">
          {skills.length ? (
            <CvSection
              title="Skills"
              {...sectionProps}
            >
              {values.skillsDisplay === "list" ? (
                <CvSkillList
                  chipClassName={config.chip}
                  isCompact={isCompact}
                  names={skills.map((row) => row.name)}
                />
              ) : (
                renderBars(skills)
              )}
            </CvSection>
          ) : null}
          {languages.length ? (
            <CvSection
              title="Languages"
              {...sectionProps}
            >
              {renderBars(languages)}
            </CvSection>
          ) : null}
          {certificates.length ? (
            <CvSection
              title="Certificates"
              {...sectionProps}
            >
              <ul className="grid gap-4">
                {certificates.map((row, index) => (
                  <CvTimelineItem
                    isCompact={isCompact}
                    key={index}
                    period={row.year?.trim()}
                    periodClassName={config.period}
                    subtitle={row.issuer?.trim()}
                    title={row.name?.trim() || "Certificate"}
                  />
                ))}
              </ul>
            </CvSection>
          ) : null}
        </aside>
      </div>
    </article>
  );
};

export default CvDocument;
