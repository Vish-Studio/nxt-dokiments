"use client";

import { useState } from "react";

import { FeatureTabButton } from "@/components/website/feature-tab-button/feature-tab-button";
import { FeatureTabVisual } from "@/components/website/feature-tab-visual/feature-tab-visual";
import { featureTabs } from "@/components/website/feature-tabs/feature-tabs-data";
import { SectionHeading } from "@/components/website/section-heading/section-heading";

export const FeatureTabs = () => {
  const [activeId, setActiveId] = useState(featureTabs[0].id);

  return (
    <section
      className="feature-tabs bg-white px-5 py-24 text-nox-noir sm:px-8 lg:px-10"
      id="overview"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          align="center"
          description="Browse the marketplace, save the templates you trust, and create documents from the same account."
          highlight="in one place."
          title="Your whole document workspace, in one place."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <ul className="grid gap-4">
            {featureTabs.map((tab) => (
              <FeatureTabButton
                description={tab.description}
                href={tab.href}
                id={tab.id}
                isActive={tab.id === activeId}
                key={tab.id}
                linkLabel={tab.linkLabel}
                onSelect={() => setActiveId(tab.id)}
                title={tab.title}
              />
            ))}
          </ul>

          <div className="relative aspect-square overflow-hidden rounded-box bg-base-200 sm:aspect-4/3">
            {featureTabs.map((tab, index) => (
              <FeatureTabVisual
                accent={tab.accent}
                fit={tab.fit}
                imageAlt={tab.imageAlt}
                imageSrc={tab.imageSrc}
                isActive={tab.id === activeId}
                key={tab.id}
                priority={index === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
