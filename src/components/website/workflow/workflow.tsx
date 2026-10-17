import { SectionHeading } from "@/components/website/section-heading/section-heading";
import { WorkflowStep } from "@/components/website/workflow-step/workflow-step";

const workflowSteps = [
  {
    accent: "bg-play-teal",
    description:
      "Create an account so saved templates and documents stay attached to your workspace.",
    title: "Sign up or sign in",
  },
  {
    accent: "bg-play-pink",
    description:
      "Browse the marketplace and add the templates your business will reuse.",
    title: "Save templates",
  },
  {
    accent: "bg-play-purple",
    description:
      "Choose from My Templates, fill the form fields, and preview the document instantly.",
    title: "Create documents",
  },
  {
    accent: "bg-golden-harvest",
    description:
      "Return to the dashboard to see your documents, saved templates, clients, and plan in one place.",
    title: "Manage the workspace",
  },
];

export const Workflow = () => {
  return (
    <section
      className="workflow bg-nox-noir px-5 py-24 text-nox-noir sm:px-8 lg:px-10"
      id="workflow"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          className="max-w-4xl"
          align="center"
          description="The website introduces the product. The signed-in app does the real work, on desktop, tablet, and mobile."
          highlight="four steps."
          title="From sign-up to sent in four steps."
          tone="dark"
        />

        <ol className="website-stagger my-16 grid gap-12 md:grid-cols-2 xl:grid-cols-4 xl:gap-8">
          {workflowSteps.map((step, index) => (
            <WorkflowStep
              accent={step.accent}
              description={step.description}
              isFirst={index === 0}
              isLast={index === workflowSteps.length - 1}
              key={step.title}
              step={index + 1}
              title={step.title}
            />
          ))}
        </ol>
      </div>
    </section>
  );
};
