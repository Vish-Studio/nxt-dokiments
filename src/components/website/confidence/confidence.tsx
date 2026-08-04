import {
  ArrowsClockwise,
  DeviceMobile,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";

const confidenceItems = [
  {
    description: "Role-based access keeps free, silver, gold, special, and superadmin capabilities aligned with the signed-in account.",
    icon: ShieldCheck,
    title: "Access follows the account",
  },
  {
    description: "Templates move from marketplace preview to saved library to document creation without changing context.",
    icon: ArrowsClockwise,
    title: "One continuous workflow",
  },
  {
    description: "The dashboard, template flows, and document views are designed to stay usable across desktop, tablet, and mobile.",
    icon: DeviceMobile,
    title: "Responsive by default",
  },
];

export const Confidence = () => {
  return (
    <section className="confidence bg-white px-5 py-24 text-nox-noir sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="website-reveal">
            <p className="font-title text-sm font-bold uppercase tracking-wide text-nox-noir/55">
              Why sign in
            </p>
            <h2 className="mt-3 font-title text-4xl font-bold leading-tight sm:text-5xl">
              The value compounds once your templates are attached to your workspace.
            </h2>
          </div>

          <div className="grid gap-3">
            {confidenceItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="grid gap-4 rounded-box border border-steel-mist bg-base-100 p-5 transition-colors hover:bg-base-200 sm:grid-cols-[3rem_1fr]"
                  key={item.title}
                >
                  <span className="flex size-12 items-center justify-center rounded-box bg-nox-noir text-golden-harvest">
                    <Icon aria-hidden size={22} weight="bold" />
                  </span>
                  <span>
                    <span className="block font-title text-xl font-bold">{item.title}</span>
                    <span className="mt-2 block text-sm leading-6 text-nox-noir/62">
                      {item.description}
                    </span>
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
