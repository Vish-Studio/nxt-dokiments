"use client";

import { PlanCard } from "@/components/commons/plan-card/plan-card";
import type { PlanCardVariant } from "@/components/commons/plan-card/plan-card";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/auth";

type PlanRole = Extract<UserRole, "free" | "silver" | "gold">;

type Plan = {
  description: string;
  features: string[];
  name: string;
  period?: string;
  price: string;
  role: PlanRole;
  variant: PlanCardVariant;
};

const plans: Plan[] = [
  {
    description: "For individuals getting started with documents.",
    features: ["Browse free templates", "Up to 5 documents", "Basic exports"],
    name: "Free",
    price: "$0",
    role: "free",
    variant: "default",
  },
  {
    description: "For freelancers and small teams reusing documents weekly.",
    features: ["Full template marketplace", "Unlimited documents", "Saved favorites", "Email support"],
    name: "Silver",
    period: "/mo",
    price: "$12",
    role: "silver",
    variant: "accent",
  },
  {
    description: "For businesses that need control, sharing, and scale.",
    features: ["Everything in Silver", "Workspace libraries", "Team sharing", "Priority support"],
    name: "Gold",
    period: "/mo",
    price: "$29",
    role: "gold",
    variant: "featured",
  },
];

export const SubscriptionPlans = () => {
  const user = useAuthStore((state) => state.user);
  const currentRole = user?.role ?? "free";

  return (
    <section className="w-full">
      <div className="pb-4">
        <h3 className="font-title text-lg font-bold text-nox-noir">Plans</h3>
        <p className="mt-1 text-sm leading-6 text-nox-noir/60">
          Choose the plan that fits your workflow. Your current plan is highlighted below.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.role === currentRole;

          return (
            <PlanCard
              action={
                isCurrent
                  ? { disabled: true, label: "Current plan" }
                  : { label: `Choose ${plan.name}` }
              }
              badge={isCurrent ? "Current plan" : undefined}
              description={plan.description}
              features={plan.features}
              key={plan.role}
              name={plan.name}
              period={plan.period}
              price={plan.price}
              variant={plan.variant}
            />
          );
        })}
      </div>
    </section>
  );
};
