"use client";

import { useState } from "react";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { SectionHeading } from "@/components/website/section-heading/section-heading";
import {
  getStyleAccent,
  getStyleLabel,
} from "@/components/website/style-display/style-display";
import { StyleSwitcherButton } from "@/components/website/style-switcher-button/style-switcher-button";
import { StyleSwitcherPreview } from "@/components/website/style-switcher-preview/style-switcher-preview";
import {
  getTemplateById,
  templateStyles,
  tierLabels,
} from "@/lib/market-place";
import type { MarketplaceTemplate, TemplateStyle } from "@/types/template";

const SHOWCASE_DOCUMENT = "invoice";

const showcaseStyles = templateStyles
  .map((style, index) => {
    const template = getTemplateById(`${style.id}-${SHOWCASE_DOCUMENT}`);

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

export const StyleSwitcher = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const showNext = () =>
    setActiveIndex((current) => (current + 1) % showcaseStyles.length);

  return (
    <section
      className="style-switcher bg-nox-noir px-5 py-24 text-white sm:px-8 lg:px-10"
      id="styles"
    >
      <div className="style-switcher-region mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            description="Every document type comes in a range of styles. Pick the look that fits your brand before you save it."
            eyebrow="Template styles"
            highlight="Every style."
            title="One document. Every style."
            tone="dark"
          />

          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-1">
            {showcaseStyles.map(({ style }, index) => (
              <StyleSwitcherButton
                description={style.description}
                isActive={index === activeIndex}
                key={style.id}
                name={getStyleLabel(style.id)}
                onProgressEnd={showNext}
                onSelect={() => setActiveIndex(index)}
                tierLabel={tierLabels[style.tier]}
                tierVariant={style.tier}
              />
            ))}
          </div>

          <div className="mt-8 hidden lg:block">
            <LinkButton
              href="/marketplace"
              variant="accent"
            >
              See every style in the marketplace
            </LinkButton>
          </div>
        </div>

        <div
          aria-label="Invoice shown in each template style"
          className="relative h-112 overflow-hidden rounded-box sm:h-136"
          role="group"
        >
          {showcaseStyles.map(({ accent, template }, index) => (
            <StyleSwitcherPreview
              accent={accent}
              isActive={index === activeIndex}
              key={template.id}
              template={template}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
