"use client";

import { Sparkle } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { useState } from "react";

import { HeroActions } from "@/components/website/hero-actions/hero-actions";
import { HeroCredit } from "@/components/website/hero-credit/hero-credit";
import { HeroFeatureTile } from "@/components/website/hero-feature-tile/hero-feature-tile";
import { heroIntroSteps } from "@/components/website/hero-intro/hero-intro-steps";
import { HeroHeadline } from "@/components/website/hero-headline/hero-headline";
import { cn } from "@/lib/utils";

// Reveal timing, in seconds. One quick, subtle sequence: each block fades up 8px over 0.5s
// (`.hero-reveal` in globals.css) on a short stagger, so the whole card is readable within about
// 0.8s of load. On a step change only the headline and paragraph replay, almost at once.
const loadRevealAt = {
  pill: 0,
  headline: 0.06,
  description: 0.14,
  actions: 0.22,
  stepper: 0.3,
  credit: 0.34,
};
const stepRevealAt = { headline: 0, description: 0.06 };
const revealStyle = (delay: number) =>
  ({ "--reveal-delay": `${delay}s` }) as CSSProperties;

// The hero's left card: walks through the app's process one step at a time. The active step
// sets the card's page tone and its headline; the tile's progress bar advances to the next step.
const headlineClassName =
  "mx-auto mt-5 max-w-xl font-title text-4xl font-bold leading-[1.05] tracking-tight text-nox-noir sm:text-5xl lg:mx-0 lg:mt-4";

export interface HeroIntroProps {
  /**
   * Called with the new step's index whenever the step changes (autoplay or a
   * click), so `HeroShowcase` can switch the device scene beside the card.
   */
  onStepChange?: (index: number) => void;
}

export const HeroIntro = ({ onStepChange }: HeroIntroProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  // The first step lingers a few seconds after load before autoplay starts; any advance or click ends it.
  const [isFirstRun, setIsFirstRun] = useState(true);
  const goTo = (index: number) => {
    setIsFirstRun(false);
    setActiveIndex(index);
    onStepChange?.(index);
  };
  const activeStep = heroIntroSteps[activeIndex];
  const copyRevealAt = isFirstRun ? loadRevealAt : stepRevealAt;

  return (
    <div
      className={cn(
        "hero-intro flex flex-1 flex-col rounded-box px-6 pt-10 pb-6 text-center transition-colors duration-500 ease-out motion-reduce:transition-none sm:px-10 lg:px-12 lg:pt-6 lg:pb-5 lg:text-left",
        activeStep.accent,
      )}
    >
      <div className="my-auto">
        <span
          className="hero-reveal inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 font-title text-xs font-bold uppercase text-nox-noir mb-4"
          style={revealStyle(loadRevealAt.pill)}
        >
          <Sparkle
            aria-hidden
            size={14}
            weight="fill"
          />
          Document workspace
        </span>
        {/* Re-keyed per step so each step replays the same quick fade-up as the first load.
            The min height (sized for the longest step) keeps the CTAs from jumping between steps. */}
        <div
          className="lg:min-h-60"
          key={activeStep.id}
        >
          <HeroHeadline
            className={cn("hero-reveal", headlineClassName)}
            highlight={activeStep.highlight}
            lead={activeStep.lead}
            style={revealStyle(copyRevealAt.headline)}
          />
          <p
            className="hero-reveal mx-auto mt-5 max-w-md text-base leading-7 text-nox-noir/70 sm:text-lg sm:leading-8 lg:mx-0 lg:mt-4"
            style={revealStyle(copyRevealAt.description)}
          >
            {activeStep.description}
          </p>
        </div>
        <HeroActions
          className="hero-reveal mt-8 lg:mt-6"
          style={revealStyle(loadRevealAt.actions)}
          secondaryClassName="border-transparent bg-white hover:bg-white/80"
        />
      </div>

      <ol
        aria-label="How Dokiments works"
        className="hero-reveal mt-8 grid grid-cols-3 gap-2 lg:mt-6"
        style={revealStyle(loadRevealAt.stepper)}
      >
        {heroIntroSteps.map((step, index) => (
          <HeroFeatureTile
            accent={step.accent}
            icon={step.icon}
            isActive={index === activeIndex}
            isDelayed={isFirstRun}
            key={step.id}
            label={step.label}
            onProgressEnd={() => goTo((index + 1) % heroIntroSteps.length)}
            onSelect={() => goTo(index)}
            step={index + 1}
            title={step.title}
          />
        ))}
      </ol>

      <HeroCredit
        className="hero-reveal mt-6 text-nox-noir/55 lg:mt-4"
        style={revealStyle(loadRevealAt.credit)}
      />
    </div>
  );
};

export default HeroIntro;
