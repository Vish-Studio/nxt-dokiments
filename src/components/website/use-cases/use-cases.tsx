import {
  Briefcase,
  FileText,
  Handshake,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

const useCases = [
  {
    accent: "bg-play-teal",
    description: "Turn quotes, proposals, and invoices around faster without leaving details scattered across files.",
    icon: Receipt,
    title: "Freelancers",
  },
  {
    accent: "bg-play-pink",
    description: "Keep contracts, NDAs, and client documents consistent while the team works from the same saved templates.",
    icon: Briefcase,
    title: "Small teams",
  },
  {
    accent: "bg-play-blue",
    description: "Give clients polished documents without rebuilding the same structure for every engagement.",
    icon: Handshake,
    title: "Studios",
  },
  {
    accent: "bg-golden-harvest",
    description: "Create operational documents from guided fields so repeat admin work stays predictable.",
    icon: FileText,
    title: "Operators",
  },
];

export const UseCases = () => {
  return (
    <section className="use-cases bg-white px-5 py-24 text-nox-noir sm:px-8 lg:px-10" id="use-cases">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-end">
          <div className="website-reveal">
            <p className="font-title text-sm font-bold uppercase tracking-wide text-nox-noir/55">
              Built for repeat documents
            </p>
            <h2 className="mt-3 font-title text-4xl font-bold leading-tight sm:text-5xl">
              Clear paths for the people who create client-ready paperwork.
            </h2>
          </div>
          <p className="website-reveal max-w-2xl text-lg leading-8 text-nox-noir/64">
            Dokiments is strongest when a document is created more than once:
            save the best template, fill the right fields, preview the result,
            and keep the finished work tied to the account.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {useCases.map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                className={cn("website-card-reveal rounded-box p-6", item.accent)}
                key={item.title}
                style={{ "--reveal-delay": `${index * 95}ms` } as CSSProperties}
              >
                <Icon aria-hidden size={28} weight="bold" />
                <h3 className="mt-10 font-title text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-nox-noir/70">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
