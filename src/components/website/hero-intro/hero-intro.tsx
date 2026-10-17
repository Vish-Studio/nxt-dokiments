"use client";

import { Sparkle } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { useState } from "react";

import { HeroActions } from "@/components/website/hero-actions/hero-actions";
import { HeroCredit } from "@/components/website/hero-credit/hero-credit";
import { HeroFeatureTile } from "@/components/website/hero-feature-tile/hero-feature-tile";
import { heroIntroSteps } from "@/components/website/hero-intro/hero-intro-steps";
import { HeroTypedHeadline } from "@/components/website/hero-typed-headline/hero-typed-headline";
import { cn } from "@/lib/utils";

// Reveal timing, in seconds. On load the headline types in, then the paragraph, stepper, credit
// and CTAs fade up one after another; on every step change the new headline types in the same way
// and its paragraph follows. Delays derive from the headline length so the chain stays even if the
// copy changes. Slow, symmetric easing lives in `.hero-reveal` / `.hero-type-char` (globals.css).
const typeStep = 0.055;
const loadTypeStart = 0.4;
const stepTypeStart = 0.25;
const typedEndFor = (step: (typeof heroIntroSteps)[number], start: number) =>
  start + (step.lead.length + 1 + step.highlight.length) * typeStep;
const loadTypedEnd = typedEndFor(heroIntroSteps[0], loadTypeStart);
const revealAt = {
  stepper: loadTypedEnd + 0.7,
  credit: loadTypedEnd + 1.1,
  actions: loadTypedEnd + 1.5,
};
const revealStyle = (delay: number) =>
  ({ "--reveal-delay": `${delay}s` }) as CSSProperties;

// The hero's left card: walks through the app's process one step at a time. The active step
// sets the card's page tone and its headline; the tile's progress bar advances to the next step.
const headlineClassName =
  "mx-auto mt-5 max-w-xl font-title text-4xl font-bold leading-[1.05] tracking-tight text-nox-noir sm:text-5xl lg:mx-0 lg:mt-4";

export const HeroIntro = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  // The first step lingers a few seconds after load before autoplay starts; any advance or click ends it.
  const [isFirstRun, setIsFirstRun] = useState(true);
  const goTo = (index: number) => {
    setIsFirstRun(false);
    setActiveIndex(index);
  };
  const activeStep = heroIntroSteps[activeIndex];
  const typeStart = isFirstRun ? loadTypeStart : stepTypeStart;

  return (
    <div
      className={cn(
        "hero-intro flex flex-1 flex-col rounded-box px-6 pt-10 pb-6 text-center transition-colors duration-1000 ease-in-out motion-reduce:transition-none sm:px-10 lg:px-12 lg:pt-6 lg:pb-5 lg:text-left",
        activeStep.accent,
      )}
    >
      <div className="my-auto">
        <span
          className="hero-reveal inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 font-title text-xs font-bold uppercase text-nox-noir mb-4"
          style={revealStyle(0.15)}
        >
          <Sparkle
            aria-hidden
            size={14}
            weight="fill"
          />
          Document workspace
        </span>
        {/* Re-keyed per step so each step replays the same type-in + fade-up as the first load.
            The min height (sized for the longest step) keeps the CTAs from jumping between steps. */}
        <div
          className="lg:min-h-60"
          key={activeStep.id}
        >
          <HeroTypedHeadline
            className={headlineClassName}
            highlight={activeStep.highlight}
            lead={activeStep.lead}
            startDelay={typeStart}
            stepDelay={typeStep}
          />
          <p
            className="hero-reveal mx-auto mt-5 max-w-md text-base leading-7 text-nox-noir/70 sm:text-lg sm:leading-8 lg:mx-0 lg:mt-4"
            style={revealStyle(typedEndFor(activeStep, typeStart) + 0.2)}
          >
            {activeStep.description}
          </p>
        </div>
        <HeroActions
          className="hero-reveal mt-8 lg:mt-6"
          style={revealStyle(revealAt.actions)}
          secondaryClassName="border-transparent bg-white hover:bg-white/80"
        />
      </div>

      <ol
        aria-label="How Dokiments works"
        className="hero-reveal mt-8 grid grid-cols-3 gap-2 lg:mt-6"
        style={revealStyle(revealAt.stepper)}
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
        style={revealStyle(revealAt.credit)}
      />
    </div>
  );
};

export default HeroIntro;
