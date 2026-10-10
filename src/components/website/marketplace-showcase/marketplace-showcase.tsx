"use client";

import { useState } from "react";

import { Carousel } from "@/components/commons/carousel/carousel";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { SectionHeading } from "@/components/website/section-heading/section-heading";
import {
  getStyleAccent,
  getStyleLabel,
} from "@/components/website/style-display/style-display";
import { StyleShowcaseCard } from "@/components/website/style-showcase-card/style-showcase-card";
import {
  getTemplateById,
  templateStyles,
  tierLabels,
} from "@/lib/market-place";
import type {
  DocumentType,
  MarketplaceTemplate,
  TemplateStyle,
  TemplateStyleId,
} from "@/types/template";

const DEFAULT_SHOWCASE_DOCUMENT: DocumentType = "invoice";

// Each style leads with a different document so the row shows range.
const showcaseDocuments: Partial<Record<TemplateStyleId, DocumentType>> = {
  brutalist: "change-order",
  classic: "proposal",
  minimalist: "invoice",
  modern: "contract",
};

const showcaseStyles = templateStyles
  .map((style, index) => {
    const documentType =
      showcaseDocuments[style.id] ?? DEFAULT_SHOWCASE_DOCUMENT;
    const template = getTemplateById(`${style.id}-${documentType}`);

    return template ? { accent: getStyleAccent(index), style, template } : null;
  })
  .filter(
    (
      item,
    ): item is {
      accent: string;
      style: TemplateStyle;
      template: MarketplaceTemplate;
    } => Boolean(item),
  );

const getAuthUrl = (templateId: string) => {
  const next = `/marketplace?template=${encodeURIComponent(templateId)}`;

  return `/sign-up?next=${encodeURIComponent(next)}`;
};

export const MarketplaceShowcase = () => {
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);

  return (
    <section
      className="marketplace-showcase bg-base-200 px-5 py-24 sm:px-8 lg:px-10"
      id="marketplace"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeading
            description="Preview the same invoices, contracts, quotations, and proposals available inside the dashboard. Save one after signing in, or browse the full marketplace first."
            highlight="real templates,"
            title="Start from real templates, not a blank page."
          />

          <div className="website-reveal flex justify-start lg:justify-end">
            <LinkButton
              href="/marketplace"
              variant="primary"
            >
              Browse all templates
            </LinkButton>
          </div>
        </div>

        <Carousel
          ariaLabel="Featured template styles"
          className="mt-14"
          header={
            <h3 className="font-title text-3xl font-bold text-nox-noir">
              Choose your style
            </h3>
          }
          navigationPlacement="header"
        >
          {showcaseStyles.map(({ accent, style, template }) => (
            <div
              className="min-w-0 shrink-0 basis-[82%] sm:basis-[46%] lg:basis-[31%] xl:basis-[24%]"
              key={style.id}
            >
              <StyleShowcaseCard
                accent={accent}
                description={style.description}
                name={getStyleLabel(style.id)}
                onPreview={() => setPreview(template)}
                template={template}
                tierLabel={tierLabels[style.tier]}
                tierVariant={style.tier}
              />
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
