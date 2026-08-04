import {
  BookmarkSimple,
  FileText,
  MagnifyingGlass,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

const templateCards = [
  {
    accent: "bg-golden-harvest",
    description: "Ready-to-send invoice for client work.",
    label: "Invoice",
  },
  {
    accent: "bg-play-pink",
    description: "Simple agreement with editable clauses.",
    label: "Contract",
  },
  {
    accent: "bg-play-teal",
    description: "Pricing sheet for fast approvals.",
    label: "Quotation",
  },
  {
    accent: "bg-steel-mist",
    description: "Quick proposal template to win more business.",
    label: "Proposal",
  },
];

export const HeroProductMockup = () => {
  return (
    <div className="website-hero-visual h-full p-3 hidden lg:block">
      <div className="relative flex h-full min-h-[520px] items-center overflow-hidden rounded-[1.35rem] p-4 sm:p-6">
        <div className="absolute right-8 top-8 size-32 rounded-full bg-golden-harvest/35 blur-3xl website-float" />
        <div className="absolute bottom-10 left-8 size-24 rounded-full bg-play-teal/28 blur-2xl website-float-delayed" />

        <div
          className="website-hero-card relative z-10 mx-auto grid w-full max-w-3xl gap-4 lg:grid-cols-[1fr_0.72fr] lg:items-center"
          style={{ "--hero-card-delay": "120ms" } as CSSProperties}
        >
          <div className="min-w-0 rounded-[1.25rem] border border-steel-mist bg-white p-4 shadow-soft sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-title text-xs font-bold uppercase text-nox-noir/45">
                  Template marketplace
                </p>
                <h3 className="mt-1 font-title text-2xl font-bold leading-tight text-nox-noir">
                  Pick the document your business needs next.
                </h3>
              </div>
              <span className="flex size-11 items-center justify-center rounded-box bg-nox-noir text-golden-harvest">
                <Sparkle aria-hidden size={20} weight="fill" />
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-box border border-steel-mist bg-base-100 px-4 py-3 text-nox-noir/50">
              <MagnifyingGlass aria-hidden size={18} weight="bold" />
              <span className="font-title text-sm font-semibold">Search invoices, contracts...</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {templateCards.map((card, index) => (
                <div
                  className={`${card.accent} min-h-44 rounded-box p-4 text-nox-noir transition-transform hover:-translate-y-1`}
                  key={card.label}
                  style={{ "--hero-card-delay": `${220 + index * 80}ms` } as CSSProperties}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-white/55">
                      <FileText aria-hidden size={16} weight="bold" />
                    </span>
                    <BookmarkSimple aria-hidden size={18} weight="fill" />
                  </div>
                  <p className="mt-8 font-title text-lg font-bold leading-tight">
                    {card.label}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-nox-noir/64">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-box bg-nox-noir px-4 py-3 text-white">
              <span className="text-sm text-white/68">Save templates once. Reuse them from the dashboard.</span>
              <span className="rounded-field bg-golden-harvest px-4 py-2 font-title text-sm font-bold text-nox-noir">
                Save template
              </span>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="absolute -right-3 -top-3 hidden h-full w-full rounded-[1.1rem] border border-steel-mist bg-white/60 lg:block" />
            <div className="relative rounded-[1.1rem] border border-steel-mist bg-white p-5 shadow-[0_24px_60px_rgb(20_20_20_/_0.14)]">
              <div className="flex items-start justify-between border-b border-steel-mist pb-4">
                <div>
                  <p className="font-title text-xl font-bold text-nox-noir">Invoice</p>
                  <p className="mt-1 text-xs text-nox-noir/50">Generated from Classic Invoice</p>
                </div>
                <span className="rounded-field bg-golden-harvest px-3 py-1.5 font-title text-xs font-bold text-nox-noir">
                  Preview
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="h-3 w-3/4 rounded-full bg-steel-mist" />
                <div className="h-3 w-1/2 rounded-full bg-steel-mist" />
                <div className="mt-3 grid gap-2">
                  <div className="grid grid-cols-[1fr_4.5rem] gap-2">
                    <span className="h-9 rounded-lg bg-base-200" />
                    <span className="h-9 rounded-lg bg-base-200" />
                  </div>
                  <div className="grid grid-cols-[1fr_4.5rem] gap-2">
                    <span className="h-9 rounded-lg bg-base-200" />
                    <span className="h-9 rounded-lg bg-base-200" />
                  </div>
                  <div className="grid grid-cols-[1fr_4.5rem] gap-2">
                    <span className="h-9 rounded-lg bg-base-200" />
                    <span className="h-9 rounded-lg bg-base-200" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-box bg-nox-noir px-4 py-4 text-white">
                <span className="font-title text-sm font-bold">Total due</span>
                <span className="font-title text-2xl font-bold text-golden-harvest">$4,280</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
