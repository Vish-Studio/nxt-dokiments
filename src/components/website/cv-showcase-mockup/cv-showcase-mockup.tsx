import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

import { ShowcaseDocument } from "@/components/website/showcase-document/showcase-document";
import { cn } from "@/lib/utils";
import { studentCvValues } from "@/lib/website/student-cv";

export interface CvShowcaseMockupProps {
  className?: string;
}

const styles = ["Classic", "Modern", "Minimalist"];

/**
 * The student CV section's picture: one student's CV in the three real CV
 * styles, fanned on a pink panel, with the style picker above them. Built from
 * the catalog templates and `studentCvValues`, so it matches what a student
 * gets. Decorative (`inert`, `aria-hidden`); the section text carries the
 * meaning.
 */
export const CvShowcaseMockup = ({ className }: CvShowcaseMockupProps) => (
  <div
    aria-hidden
    className={cn(
      "cv-showcase-mockup relative aspect-square overflow-hidden rounded-box bg-play-pink sm:aspect-5/4",
      className,
    )}
    inert
  >
    <div className="absolute left-1/2 top-[7%] z-30 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white p-1 shadow-soft">
      {styles.map((style) => (
        <span
          className={cn(
            "rounded-full px-3 py-1 font-title text-xs font-bold",
            style === "Modern" ? "bg-nox-noir text-white" : "text-nox-noir/60",
          )}
          key={style}
        >
          {style}
        </span>
      ))}
    </div>

    <ShowcaseDocument
      compact
      className="absolute left-[7%] top-[27%] w-[32%] -rotate-6"
      templateId="classic-cv"
      values={studentCvValues}
    />
    <ShowcaseDocument
      compact
      className="absolute right-[7%] top-[27%] w-[32%] rotate-6"
      templateId="minimalist-cv"
      values={studentCvValues}
    />
    <ShowcaseDocument
      compact
      className="absolute left-1/2 top-[19%] z-20 w-[38%] -translate-x-1/2"
      templateId="modern-cv"
      values={studentCvValues}
    />

    <div className="absolute bottom-[5%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-field bg-white px-3 py-2 font-title text-xs font-bold text-nox-noir shadow-soft">
      <CheckCircle
        className="text-success"
        size={16}
        weight="fill"
      />
      Ready to attach as a PDF
    </div>
  </div>
);

export default CvShowcaseMockup;
