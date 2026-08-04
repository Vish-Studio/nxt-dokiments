import type { CSSProperties } from "react";

const workflowSteps = [
  {
    description: "Create an account so saved templates and documents stay attached to your workspace.",
    title: "Sign up or sign in",
  },
  {
    description: "Browse the marketplace and add the templates your business will reuse.",
    title: "Save templates",
  },
  {
    description: "Choose from My Templates, fill the form fields, and preview the document instantly.",
    title: "Create documents",
  },
  {
    description: "Return to the dashboard to track documents, plan limits, and recent template activity.",
    title: "Manage the workspace",
  },
];

export const Workflow = () => {
  return (
    <section className="bg-golden-harvest px-5 py-24 sm:px-8 lg:px-10" id="workflow">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="website-reveal">
            <h2 className="font-title text-4xl font-bold leading-tight text-nox-noir sm:text-5xl">
              Built around the same flow your dashboard uses.
            </h2>
            <p className="mt-5 text-lg leading-8 text-nox-noir/65">
              The website introduces the product, but the signed-in app handles
              the real work: saving templates, generating documents, and keeping
              the workspace organized across desktop, tablet, and mobile.
            </p>
          </div>

          <div className="grid gap-3">
            {workflowSteps.map((step, index) => (
              <div
                className="website-card-reveal grid gap-4 rounded-box border border-steel-mist bg-base-100 p-5 transition-colors hover:bg-base-200 sm:grid-cols-[4rem_1fr] sm:items-start"
                key={step.title}
                style={{ "--reveal-delay": `${index * 95}ms` } as CSSProperties}
              >
                <span className="font-title text-3xl font-bold text-golden-harvest">
                  0{index + 1}
                </span>
                <span>
                  <span className="block font-title text-xl font-bold text-nox-noir">
                    {step.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-nox-noir/62">
                    {step.description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
