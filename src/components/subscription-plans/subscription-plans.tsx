"use client";

import { CheckIcon } from "@phosphor-icons/react";

import { Button } from "@/components/button/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/auth";

type PlanRole = Extract<UserRole, "free" | "silver" | "gold">;

type Plan = {
  description: string;
  features: string[];
  name: string;
  price: string;
  role: PlanRole;
};

const plans: Plan[] = [
  {
    description: "For individuals getting started with documents.",
    features: ["Browse free templates", "Up to 5 documents", "Basic exports"],
    name: "Free",
    price: "$0",
    role: "free",
  },
  {
    description: "For freelancers and small teams reusing documents weekly.",
    features: ["Full template marketplace", "Unlimited documents", "Saved favorites", "Email support"],
    name: "Silver",
    price: "$12",
    role: "silver",
  },
  {
    description: "For businesses that need control, sharing, and scale.",
    features: ["Everything in Silver", "Workspace libraries", "Team sharing", "Priority support"],
    name: "Gold",
    price: "$29",
    role: "gold",
  },
];

export const SubscriptionPlans = () => {
  const user = useAuthStore((state) => state.user);
  const currentRole = user?.role ?? "free";

  return (
    <section className="w-full">
      <div className="border-b border-steel-mist pb-4">
        <h3 className="font-title text-lg font-bold text-bloodwood-deep">Plans</h3>
        <p className="mt-1 text-sm leading-6 text-nox-noir/60">
          Choose the plan that fits your workflow. Your current plan is highlighted below.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.role === currentRole;

          return (
            <article
              className={cn(
                "flex flex-col rounded-box border bg-base-100 p-6",
                isCurrent ? "border-bloodwood-deep" : "border-steel-mist",
              )}
              key={plan.role}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-title text-lg font-bold text-nox-noir">{plan.name}</h3>
                {isCurrent ? (
                  <span className="inline-flex items-center rounded-box bg-bloodwood-deep px-2.5 py-1 font-title text-xs font-bold text-white">
                    Current plan
                  </span>
                ) : null}
              </div>

              <div className="mt-4 font-title text-3xl font-bold text-nox-noir">
                {plan.price}
                {plan.price !== "$0" ? (
                  <span className="text-sm font-semibold text-nox-noir/50">/mo</span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-6 text-nox-noir/60">{plan.description}</p>

              <ul className="mt-6 grid gap-3">
                {plan.features.map((feature) => (
                  <li className="flex items-center gap-2.5 text-sm text-nox-noir/75" key={feature}>
                    <CheckIcon aria-hidden className="shrink-0 text-bloodwood-deep" size={16} weight="bold" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-2">
                <Button
                  className="w-full"
                  disabled={isCurrent}
                  variant={isCurrent ? "secondary" : "primary"}
                >
                  {isCurrent ? "Current plan" : `Choose ${plan.name}`}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
