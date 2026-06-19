import { FileText, MagnifyingGlass, ShareNetwork } from "@phosphor-icons/react/dist/ssr";

const features = [
  {
    description: "Search templates by document type, business function, or use case.",
    icon: MagnifyingGlass,
    title: "Find the right document",
  },
  {
    description: "Use polished invoices, contracts, quotations, forms, and briefs.",
    icon: FileText,
    title: "Start from trusted templates",
  },
  {
    description: "Share finished files with your team and keep document work organized.",
    icon: ShareNetwork,
    title: "Send work forward",
  },
];

export const Overview = () => {
  return (
    <section className="bg-nox-noir px-5 py-24 text-white sm:px-8 lg:px-10" id="overview">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <h2 className="font-title text-4xl font-bold leading-tight text-golden-harvest sm:text-5xl">
            A document marketplace built for the daily paperwork of real businesses.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-white/68">
            Dokiments gives founders, operators, freelancers, and teams a clean
            place to discover ready-to-use business documents without starting
            from a blank page.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className="rounded-box border border-white/12 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-golden-harvest/50 hover:bg-white/[0.07] website-reveal"
                key={feature.title}
              >
                <Icon aria-hidden className="text-golden-harvest" size={28} weight="bold" />
                <h3 className="mt-8 font-title text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
