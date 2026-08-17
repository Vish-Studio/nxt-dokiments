"use client";

import {
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import { useState } from "react";

import { Carousel } from "@/components/commons/carousel/carousel";
import { TemplateCard } from "@/components/commons/template-card/template-card";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { getTemplateById } from "@/lib/market-place";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

const showcaseItems = [
  {
    className: "xl:translate-y-10 xl:rotate-[-3deg]",
    id: "classic-proposal",
    label: "Classic",
  },
  {
    className: "xl:-translate-y-2 xl:rotate-[2deg]",
    id: "modern-contract",
    label: "Modern",
  },
  {
    className: "xl:translate-y-16 xl:rotate-[3deg]",
    id: "brutalist-change-order",
    label: "Brutalist",
  },
  {
    className: "xl:translate-y-5 xl:rotate-[-2deg]",
    id: "minimalist-invoice",
    label: "Minimalist",
  },
]
  .map((item) => {
    const template = getTemplateById(item.id);

    return template ? { ...item, template } : null;
  })
  .filter((item): item is {
    className: string;
    id: string;
    label: string;
    template: MarketplaceTemplate;
  } => Boolean(item));

const getAuthUrl = (templateId: string) => {
  const next = `/marketplace?template=${encodeURIComponent(templateId)}`;

  return `/sign-up?next=${encodeURIComponent(next)}`;
};

export const MarketplaceShowcase = () => {
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);

  return (
    <section className="bg-golden-harvest px-5 py-24 sm:px-8 lg:px-10" id="marketplace">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div className="website-reveal">
            <h2 className="font-title text-4xl font-bold leading-tight text-nox-noir sm:text-5xl">
              Start from real templates already in the marketplace.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-nox-noir/62">
              Preview the same invoices, contracts, quotations, and proposals
              available inside the dashboard. Save one after signing in, or browse
              the full marketplace first.
            </p>
          </div>

          <div className="website-reveal flex justify-start lg:justify-end">
            <a
              className="group inline-flex items-center justify-center gap-2 rounded-box bg-nox-noir px-5 py-3 font-title text-sm font-bold text-golden-harvest transition hover:brightness-110"
              href="/marketplace"
            >
              Browse all templates
              <ArrowRight aria-hidden className="arrow-cta-icon" size={17} weight="bold" />
            </a>
          </div>
        </div>

        <Carousel
          ariaLabel="Featured marketplace templates"
          className="mt-14"
          viewportClassName="xl:py-20"
        >
          {showcaseItems.map((item, index) => (
            <div
              className={cn(
                "website-card-reveal group relative flex min-w-0 shrink-0 basis-[82%] flex-col items-center sm:basis-[46%] xl:basis-0 xl:flex-1",
                item.className,
              )}
              key={item.template.id}
              style={{ "--reveal-delay": `${160 + index * 135}ms` } as CSSProperties}
            >
              <TemplateCard
                className="w-full max-w-72"
                onPreview={() => setPreview(item.template)}
                template={item.template}
              />
              <span className="mt-5 inline-flex rounded-full bg-nox-noir px-4 py-2 font-title text-xs font-bold uppercase tracking-normal text-golden-harvest transition group-hover:-translate-y-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </Carousel>
      </div>

      <TemplatePreviewDialog
        onClose={() => setPreview(null)}
        onSave={() => {
          if (preview) {
            window.location.href = getAuthUrl(preview.id);
          }
        }}
        template={preview}
      />
    </section>
  );
};
