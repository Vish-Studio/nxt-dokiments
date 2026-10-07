import {
  Briefcase,
  FileText,
  Handshake,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";

import { SectionHeading } from "@/components/website/section-heading/section-heading";
import { ShowcaseCard } from "@/components/website/showcase-card/showcase-card";

const useCases = [
  {
    accent: "bg-play-teal",
    description:
      "Turn quotes, proposals, and invoices around faster without leaving details scattered across files.",
    icon: Receipt,
    tag: "Invoices + quotes",
    title: "Freelancers",
  },
  {
    accent: "bg-play-pink",
    description:
      "Keep contracts, NDAs, and client documents consistent by reusing the same saved templates every time.",
    icon: Briefcase,
    tag: "Contracts + NDAs",
    title: "Small businesses",
  },
  {
    accent: "bg-play-blue",
    description:
      "Give clients polished documents without rebuilding the same structure for every engagement.",
    icon: Handshake,
    tag: "Proposals",
    title: "Studios",
  },
  {
    accent: "bg-golden-harvest",
    description:
      "Create operational documents from guided fields so repeat admin work stays predictable.",
    icon: FileText,
    tag: "Operations",
    title: "Operators",
  },
];

export const UseCases = () => {
  return (
    <section
      className="use-cases bg-white px-5 py-24 text-nox-noir sm:px-8 lg:px-10"
      id="use-cases"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          description="Dokiments is strongest when a document gets created more than once: save the best template, fill the right fields, and keep the finished work with your account."
          highlight="sends paperwork."
          title="Built for everyone who sends paperwork."
        />

        <div className="website-stagger mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {useCases.map((item) => (
            <ShowcaseCard
              accent={item.accent}
              description={item.description}
              href="/marketplace"
              icon={item.icon}
              key={item.title}
              linkLabel="Browse templates"
              tag={item.tag}
              title={item.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
