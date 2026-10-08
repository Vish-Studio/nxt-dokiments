"use client";

import { XIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/commons/button/button";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { StepIndicator } from "@/components/commons/step-indicator/step-indicator";

import { OnboardingStep } from "./onboarding-step";
import { OnboardingStepVisual } from "./onboarding-step-visual";
import { onboardingSteps } from "./onboarding-steps";

export interface OnboardingDialogProps {
  onClose: () => void;
  open: boolean;
  /** First step to show. Stories use it to render a later step directly. */
  initialStep?: number;
  /** The user's display name, for the welcome step's greeting. */
  userName?: string;
}

/**
 * The tour a new user sees on arrival after sign-up: a welcome, then how the
 * template system works (Marketplace → My Templates → Documents), clients and
 * plans. Also reopened from the sidebar's "Getting started" row.
 *
 * Laid out like the sign-in page: a rounded image container on the left, inset by
 * the same `p-3`, with the text and actions on the right. Full screen on mobile,
 * with the close button in its own row above the image; a centred card from `md` up.
 *
 * Portalled to `document.body` at `z-80` for the same reason as `FeedbackDialog`:
 * the sidebar's transformed drawer would otherwise become the containing block for
 * `position: fixed` and trap the dialog inside it.
 */
export const OnboardingDialog = ({
  initialStep = 0,
  onClose,
  open,
  userName,
}: OnboardingDialogProps) => {
  const [stepIndex, setStepIndex] = useState(initialStep);
  const titleId = useId();

  /** Resets to the first step, so reopening from the sidebar starts the tour over. */
  const close = () => {
    setStepIndex(initialStep);
    onClose();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStepIndex(initialStep);
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [initialStep, onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const step = onboardingSteps[stepIndex];
  const total = onboardingSteps.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;
  const firstName = userName?.trim().split(/\s+/)[0];
  const description =
    step.greetsUser && firstName
      ? `Hi ${firstName}! ${step.description}`
      : step.description;

  return createPortal(
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="onboarding-dialog fixed inset-0 z-80 flex md:items-center md:justify-center md:p-4"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 hidden bg-nox-noir/55 md:block"
        onClick={close}
        tabIndex={-1}
        type="button"
      />

      <div className="relative z-10 flex h-dvh w-full flex-col gap-6 overflow-hidden bg-base-100 p-3 md:h-144 md:max-w-5xl md:flex-row md:rounded-box md:border md:border-steel-mist">
        {/* Its own row on mobile, with the wordmark on the left, so the close
            button sits above the image rather than on it. From `md` up only the
            button stays, floating in the top-right corner of the text column;
            the welcome image carries the wordmark there instead. */}
        <div className="flex shrink-0 items-center justify-between pl-3 md:absolute md:top-5 md:right-5 md:z-10 md:pl-0">
          <Image
            alt="Dokiments"
            className="h-6 w-auto select-none md:hidden"
            draggable={false}
            height={24}
            src="/images/svg/logo-black.svg"
            width={120}
          />
          <ButtonIcon
            aria-label="Close onboarding"
            className="text-nox-noir hover:bg-nox-noir/10"
            icon={<XIcon aria-hidden size={18} weight="bold" />}
            onClick={close}
            size="sm"
            variant="ghost"
          />
        </div>

        <div className="relative h-56 shrink-0 overflow-hidden rounded-box md:h-auto md:w-1/2">
          {/* On every step, above the crossfading visuals so it never fades with
              them. Desktop only: on mobile the top row already shows it. */}
          <Image
            alt=""
            className="pointer-events-none absolute inset-x-0 top-10 z-10 mx-auto hidden h-6 w-auto select-none md:block"
            draggable={false}
            height={24}
            src="/images/svg/logo-black.svg"
            width={120}
          />
          {onboardingSteps.map((visualStep, index) => (
            <OnboardingStepVisual
              imageSrc={visualStep.imageSrc}
              isActive={index === stepIndex}
              key={visualStep.imageSrc}
              layout={visualStep.layout}
              tone={visualStep.tone}
            />
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 md:px-6">
          <div className="min-h-0 flex-1 overflow-y-auto pt-2 pb-6 md:pt-14">
            <OnboardingStep
              description={description}
              eyebrow={step.area}
              points={step.points}
              title={step.title}
              titleId={titleId}
            />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-steel-mist pt-3 md:pb-3">
            <StepIndicator
              current={stepIndex + 1}
              total={total}
            />
            <div className="flex gap-2">
              {isFirst ? (
                <Button
                  onClick={close}
                  size="sm"
                  variant="ghost"
                >
                  Skip
                </Button>
              ) : (
                <Button
                  onClick={() => setStepIndex(stepIndex - 1)}
                  size="sm"
                  variant="secondary"
                >
                  Previous
                </Button>
              )}
              <Button
                autoFocus
                onClick={isLast ? close : () => setStepIndex(stepIndex + 1)}
                size="sm"
                // The golden accent marks the finish, like the sign-in submit button.
                variant={isLast ? "accent" : "primary"}
              >
                {isFirst ? "Show me around" : isLast ? "Get started" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
