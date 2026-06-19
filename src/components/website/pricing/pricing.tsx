import { PlanCard } from "@/components/plan-card/plan-card";
import type { PlanCardVariant } from "@/components/plan-card/plan-card";

type PricingPlan = {
  description: string;
  features: string[];
  name: string;
  period?: string;
  price: string;
  variant: PlanCardVariant;
};

const plans: PricingPlan[] = [
  {
    description: "For individuals who need polished templates quickly.",
    features: ["Browse free templates", "Mobile responsive previews", "Basic exports"],
    name: "Starter",
    price: "Free",
    variant: "default",
  },
  {
    description: "For growing teams that reuse documents every week.",
    features: ["Full template marketplace", "Saved favorites", "Team sharing"],
    name: "Studio",
    period: "/mo",
    price: "$12",
    variant: "featured",
  },
  {
    description: "For businesses that need control, consistency, and scale.",
    features: ["Workspace libraries", "Advanced document sets", "Priority support"],
    name: "Business",
    period: "/mo",
    price: "$29",
    variant: "default",
  },
];

export const Pricing = () => {
  return (
    <section className="bg-golden-harvest px-5 py-24 sm:px-8 lg:px-10" id="pricing">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl website-reveal">
          <h2 className="font-title text-4xl font-bold leading-tight text-nox-noir sm:text-5xl">
            Start free. Upgrade when documents become part of your operating system.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              action={{ href: "/sign-up", label: "Sign up" }}
              className="website-reveal"
              description={plan.description}
              features={plan.features}
              key={plan.name}
              name={plan.name}
              period={plan.period}
              price={plan.price}
              variant={plan.variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
