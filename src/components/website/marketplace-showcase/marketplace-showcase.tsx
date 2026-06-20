"use client";

import {
  ArrowRight,
  BookmarkSimple,
  Eye,
  LockSimple,
} from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import { useState } from "react";

import { ButtonIcon } from "@/components/button-icon/button-icon";
import { TemplatePreviewDialog } from "@/components/template-preview-dialog/template-preview-dialog";
import { TemplateThumbnail } from "@/components/template-thumbnail/template-thumbnail";
import {
  marketplaceTemplates,
  tierBadgeClasses,
  tierLabels,
} from "@/lib/market-place";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

const showcaseTemplates = marketplaceTemplates.slice(0, 5);

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
              className="inline-flex items-center justify-center gap-2 rounded-box bg-nox-noir px-5 py-3 font-title text-sm font-bold text-golden-harvest transition hover:brightness-110"
              href="/marketplace"
            >
              Browse all templates
              <ArrowRight aria-hidden size={17} weight="bold" />
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {showcaseTemplates.map((template, index) => (
            <article
              className="website-card-reveal flex min-h-full flex-col rounded-box border border-steel-mist bg-base-100 p-4 transition-colors hover:bg-base-200"
              key={template.id}
              style={{ "--reveal-delay": `${index * 110}ms` } as CSSProperties}
            >
              <div className="relative">
                <TemplateThumbnail className="h-40" template={template} />
                <span
                  className={cn(
                    "absolute right-2 top-2 inline-flex items-center gap-1 rounded-field px-2 py-1 font-title text-[11px] font-semibold",
                    tierBadgeClasses[template.tier],
                  )}
                >
                  {template.tier !== "free" ? <LockSimple aria-hidden size={11} weight="bold" /> : null}
                  {tierLabels[template.tier]}
                </span>
              </div>

              <div className="mt-4 flex flex-1 flex-col">
                <p className="font-title text-base font-bold text-nox-noir">{template.name}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-nox-noir/60">
                  {template.description}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <ButtonIcon
                  aria-label={`Preview ${template.name}`}
                  icon={<Eye aria-hidden size={17} weight="bold" />}
                  onClick={() => setPreview(template)}
                  shape="square"
                  size="sm"
                  variant="outline"
                />
                <a
                  className="btn btn-sm btn-primary flex-1 font-title font-semibold tracking-normal"
                  href={getAuthUrl(template.id)}
                >
                  <BookmarkSimple aria-hidden size={17} weight="bold" />
                  Save template
                </a>
              </div>
            </article>
          ))}
        </div>
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
