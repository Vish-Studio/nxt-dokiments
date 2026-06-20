import type { CSSProperties } from "react";

import { PlanCard } from "@/components/commons/plan-card/plan-card";
import type { PlanCardVariant } from "@/components/commons/plan-card/plan-card";

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
    description: "For individuals getting started with reusable business documents.",
    features: ["Browse free templates", "Save up to 2 templates", "Create up to 5 documents"],
    name: "Free",
    price: "$0",
    variant: "default",
  },
  {
    description: "For freelancers and small teams creating documents every week.",
    features: ["Full template marketplace", "Unlimited documents", "Saved template library"],
    name: "Silver",
    period: "/mo",
    price: "$12",
    variant: "accent",
  },
  {
    description: "For businesses that need more control, consistency, and support.",
    features: ["Everything in Silver", "Workspace libraries", "Priority support"],
    name: "Gold",
    period: "/mo",
    price: "$29",
    variant: "featured",
  },
];

export const Pricing = () => {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 lg:px-10" id="pricing">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl website-reveal">
          <h2 className="font-title text-4xl font-bold leading-tight text-nox-noir sm:text-5xl">
            Start free, then upgrade when your document library grows.
          </h2>
          <p className="mt-5 text-base leading-7 text-nox-noir/70">
            Roles map directly to plan access in the app: free, silver, gold,
            plus special access for selected users and superadmin control.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <PlanCard
              action={{ href: "/sign-up", label: "Sign up" }}
              className="website-reveal"
              description={plan.description}
              features={plan.features}
              key={plan.name}
              name={plan.name}
              period={plan.period}
              price={plan.price}
              style={{ "--reveal-delay": `${index * 100}ms` } as CSSProperties}
              variant={plan.variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
