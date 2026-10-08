import Image from "next/image";

import { cn } from "@/lib/utils";

import {
  type OnboardingStepData,
  onboardingToneClasses,
} from "./onboarding-steps";

export interface OnboardingStepVisualProps
  extends Pick<OnboardingStepData, "imageSrc" | "layout" | "tone"> {
  isActive: boolean;
}

/**
 * One step's illustration on its page tone, filling the dialog's rounded image
 * container, like `AuthShowcaseSlide` on the sign-in page. The `hero` layout
 * (welcome step) also carries the Dokiments wordmark.
 *
 * Every step's visual is mounted and stacked, and only the active one is shown,
 * so the next image is already loaded when the user moves on and the swap is a
 * crossfade rather than a blank frame.
 */
export const OnboardingStepVisual = ({
  imageSrc,
  isActive,
  layout,
  tone,
}: OnboardingStepVisualProps) => (
  <div
    aria-hidden
    className={cn(
      // `select-none` plus `draggable={false}` on each image: a click-drag would
      // otherwise lift the picture out as a ghost image.
      "onboarding-step-visual absolute inset-0 flex select-none transition-opacity duration-500 ease-out motion-reduce:transition-none",
      layout === "hero"
        ? "flex-col px-3 pt-8 md:px-4 md:pt-10"
        : "items-center justify-center p-8 md:p-10",
      onboardingToneClasses[tone],
      // Hidden steps stay mounted on top of one another, so they must not catch
      // the pointer — otherwise a click lands on (and drags) another step's image.
      isActive ? "opacity-100" : "pointer-events-none opacity-0",
    )}
  >
    {layout === "hero" ? (
      // The welcome visual: the wordmark centred at the top (desktop), and a
      // transparent mockup shown as is, sitting on the container's bottom edge.
      <>
        <Image
          alt=""
          // Desktop only: on mobile the dialog's top row already shows the wordmark.
          className="hidden h-6 w-auto self-center md:block"
          draggable={false}
          height={32}
          src="/images/svg/logo-black.svg"
          width={160}
        />
        {/* Wider than the container (which clips it): the artwork has empty side
            margins built in, so fitting it exactly leaves the laptop looking
            small. Widened rather than CSS-scaled, which drew a hairline across
            the SVG's top edge. */}
        <div className="relative -mx-6 min-h-0 flex-1 md:mt-4 md:-mx-12">
          <Image
            alt=""
            className="object-contain object-bottom"
            draggable={false}
            fill
            loading="eager"
            sizes="(min-width: 768px) 520px, 90vw"
            src={imageSrc}
          />
        </div>
      </>
    ) : (
      <div
        className={cn(
          "relative overflow-hidden rounded-box border border-nox-noir/10",
          layout === "wide"
            ? "aspect-video w-full max-w-md bg-white"
            : "aspect-square h-full max-h-80 bg-white/45",
        )}
      >
        <Image
          alt=""
          className={
            layout === "wide" ? "object-contain p-4 md:p-6" : "object-cover"
          }
          draggable={false}
          fill
          loading="eager"
          sizes="(min-width: 768px) 420px, 90vw"
          src={imageSrc}
        />
      </div>
    )}
  </div>
);
