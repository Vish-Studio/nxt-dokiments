import {
  DownloadSimple,
  GraduationCap,
  Swatches,
} from "@phosphor-icons/react/dist/ssr";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { ClientsShowcasePoint } from "@/components/website/clients-showcase-point/clients-showcase-point";
import { CvShowcaseMockup } from "@/components/website/cv-showcase-mockup/cv-showcase-mockup";
import { SectionHeading } from "@/components/website/section-heading/section-heading";

const cvPoints = [
  {
    accent: "bg-play-pink",
    description:
      "Lead with your studies, projects, part-time jobs and volunteering. Optional sections stay hidden until you fill them.",
    icon: GraduationCap,
    title: "Made for a first CV",
  },
  {
    accent: "bg-play-purple",
    description:
      "Write it once and preview it in every style without retyping. Classic is free; Modern and Minimalist come with a paid plan.",
    icon: Swatches,
    title: "Switch styles in a click",
  },
  {
    accent: "bg-golden-harvest",
    description:
      "Export a clean PDF for internships, graduate roles and university applications, ready to attach.",
    icon: DownloadSimple,
    title: "Download a clean PDF",
  },
];

/**
 * The homepage's CV section, aimed at students writing their first CV: three
 * points, a call to action, and the same student's CV in the three real CV
 * styles (`CvShowcaseMockup`).
 */
export const CvShowcase = () => {
  return (
    <section
      className="cv-showcase px-5 py-24 text-nox-noir sm:px-8 lg:px-10"
      id="cvs"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <CvShowcaseMockup className="max-lg:order-last" />

        <div>
          <SectionHeading
            description="No work history yet? No problem. Dokiments walks students through a CV section by section and lays it out for you, so your first application looks as good as your grades."
            eyebrow="CVs for students"
            highlight="that gets you noticed."
            title="A first CV that gets you noticed."
          />

          <ul className="website-stagger mt-10 grid gap-6">
            {cvPoints.map((point) => (
              <ClientsShowcasePoint
                accent={point.accent}
                description={point.description}
                icon={point.icon}
                key={point.title}
                title={point.title}
              />
            ))}
          </ul>

          <div className="website-reveal mt-10">
            <LinkButton
              href="/sign-up"
              variant="primary"
            >
              Write your CV for free
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CvShowcase;
