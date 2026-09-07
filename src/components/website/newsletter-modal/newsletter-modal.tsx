"use client";

import { XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { Button } from "@/components/commons/button/button";
import { NewsletterForm } from "@/components/commons/newsletter-form/newsletter-form";
import { useCookieConsentSettled } from "@/hooks/use-cookie-consent-settled";
import { readNewsletterStatus, writeNewsletterStatus } from "@/lib/newsletter";

/**
 * How long to wait after the cookie banner is answered before asking for an
 * email. Long enough that a click aimed at the banner cannot land on this
 * modal's backdrop, which would dismiss the newsletter for good.
 */
export const NEWSLETTER_MODAL_DELAY_MS = 5000;

export interface NewsletterModalProps {
  delayMs?: number;
}

export const NewsletterModal = ({
  delayMs = NEWSLETTER_MODAL_DELAY_MS,
}: NewsletterModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isCookieConsentSettled = useCookieConsentSettled();
  const successTimer = useRef<number>(undefined);

  // Queue behind the cookie banner: one interruption at a time.
  useEffect(() => {
    if (!isCookieConsentSettled || readNewsletterStatus() !== null) {
      return;
    }

    const timer = window.setTimeout(() => setIsOpen(true), delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, isCookieConsentSettled]);

  useEffect(() => () => window.clearTimeout(successTimer.current), []);

  const closeModal = () => {
    writeNewsletterStatus("dismissed");
    setIsOpen(false);
  };

  // Leave the confirmation on screen briefly before closing.
  const handleSubscribed = () => {
    successTimer.current = window.setTimeout(() => setIsOpen(false), 1400);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="newsletter-modal-title"
      aria-modal="true"
      className="newsletter-modal fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close newsletter signup"
        className="absolute inset-0 bg-nox-noir/75"
        onClick={closeModal}
        type="button"
      />
      <section className="relative w-full max-w-md rounded-box border border-steel-mist bg-base-100 p-6 shadow-soft sm:p-8">
        <ButtonIcon
          aria-label="Close newsletter signup"
          className="absolute right-3 top-3 z-10"
          icon={
            <XIcon
              aria-hidden
              size={18}
              weight="bold"
            />
          }
          onClick={closeModal}
          size="sm"
          variant="ghost"
        />
        <p className="pr-10 font-title text-sm font-bold uppercase tracking-wide text-nox-noir/55">
          Dokiments dispatch
        </p>
        <h2
          id="newsletter-modal-title"
          className="mt-3 max-w-sm font-title text-3xl font-bold leading-tight text-nox-noir sm:text-4xl"
        >
          Make the next document easier.
        </h2>
        <p className="mt-4 max-w-md text-base leading-7 text-nox-noir/65">
          A concise monthly note with template ideas, workflow tips, and product
          updates.
        </p>
        <NewsletterForm
          className="mt-6"
          onSubscribed={handleSubscribed}
        />
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-nox-noir/50">
            No spam. Unsubscribe anytime.
          </p>
          <Button
            className="shrink-0 px-0"
            onClick={closeModal}
            size="sm"
            variant="ghost"
          >
            Not now
          </Button>
        </div>
      </section>
    </div>
  );
};
