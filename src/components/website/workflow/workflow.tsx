const workflowSteps = [
  "Choose a document",
  "Adapt the details",
  "Preview on any device",
  "Export or share",
];

export const Workflow = () => {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 lg:px-10" id="workflow">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="website-reveal">
            <h2 className="font-title text-4xl font-bold leading-tight text-nox-noir sm:text-5xl">
              From marketplace to final document in one focused flow.
            </h2>
            <p className="mt-5 text-lg leading-8 text-nox-noir/65">
              The product is responsive by default, so your team can browse,
              customize, and reuse documents from desktop, tablet, or mobile.
            </p>
          </div>

          <div className="grid gap-3">
            {workflowSteps.map((step, index) => (
              <div
                className="grid grid-cols-[4rem_1fr] items-center rounded-box border border-steel-mist bg-base-100 p-5 transition-all duration-300 hover:-translate-x-2 hover:border-nox-noir hover:shadow-soft website-reveal"
                key={step}
              >
                <span className="font-title text-3xl font-bold text-golden-harvest">
                  0{index + 1}
                </span>
                <span className="font-title text-xl font-bold text-nox-noir">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
