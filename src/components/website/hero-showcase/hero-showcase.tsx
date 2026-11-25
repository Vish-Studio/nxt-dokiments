"use client";

import { useState } from "react";

import { HeroIntro } from "@/components/website/hero-intro/hero-intro";
import { heroIntroSteps } from "@/components/website/hero-intro/hero-intro-steps";
import {
  HeroProductMockup,
  type HeroSceneId,
} from "@/components/website/hero-product-mockup/hero-product-mockup";

/**
 * The two halves of the hero, kept in step: the intro card on the left walks
 * through the app's process, and the device scene on the right switches to the
 * page each step talks about. `HeroIntro` owns the steps and autoplay; this
 * only mirrors its active step into `HeroProductMockup`.
 *
 * Renders the grid's two cells, so it sits directly inside the hero grid.
 */
export const HeroShowcase = () => {
  const [activeStepId, setActiveStepId] = useState<HeroSceneId>(
    heroIntroSteps[0].id as HeroSceneId,
  );

  return (
    <>
      <div className="hero-intro-column flex min-w-0 flex-col p-3 lg:h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-8rem)] lg:p-4 lg:pr-0">
        <HeroIntro
          onStepChange={(index) =>
            setActiveStepId(heroIntroSteps[index].id as HeroSceneId)
          }
        />
      </div>

      <HeroProductMockup activeStepId={activeStepId} />
    </>
  );
};
