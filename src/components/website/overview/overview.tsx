import {
  ChartLineUp,
  FilePlus,
  FolderSimpleStar,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

const features = [
  {
    accent: "bg-golden-harvest",
    description: "See saved templates, created documents, and current plan status from one home screen.",
    icon: ChartLineUp,
    title: "Dashboard overview",
  },
  {
    accent: "bg-play-teal",
    description: "Filter business-ready invoices, contracts, quotations, proposals, and more by style and tier.",
    icon: Storefront,
    title: "Marketplace discovery",
  },
  {
    accent: "bg-play-pink",
    description: "Keep chosen templates in a personal library so repeat work starts from the right source.",
    icon: FolderSimpleStar,
    title: "My Templates library",
  },
  {
    accent: "bg-play-purple",
    description: "Open a saved template, fill the structured fields, and preview the final document side by side.",
    icon: FilePlus,
    title: "Document generation",
  },
];

export const Overview = () => {
  return (
    <section className="bg-nox-noir px-5 py-24 text-white sm:px-8 lg:px-10" id="overview">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <h2 className="font-title text-4xl font-bold leading-tight text-golden-harvest sm:text-5xl">
            A complete document workspace after sign-up.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-white/68">
            Dokiments connects the public marketplace to the private dashboard:
            browse once, save what matters, then create and manage business
            documents from the same account.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                className={cn(
                  "website-card-reveal rounded-box p-6 text-nox-noir transition hover:-translate-y-1 hover:brightness-95",
                  feature.accent,
                )}
                key={feature.title}
                style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
              >
                <Icon aria-hidden className="text-nox-noir" size={28} weight="bold" />
                <h3 className="mt-8 font-title text-xl font-bold text-nox-noir">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-nox-noir/70">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
