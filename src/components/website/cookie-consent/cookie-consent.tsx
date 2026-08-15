"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/commons/button/button";
import { updateConsent } from "@/lib/analytics/gtag";
import type { CookieConsentChoice } from "@/lib/cookie-consent";
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/cookie-consent";

export const CookieConsent = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const initialStateTimer = window.setTimeout(() => {
      setIsOpen(readCookieConsent() === null);
    }, 0);

    const openSettings = () => setIsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);

    return () => {
      window.clearTimeout(initialStateTimer);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    };
  }, []);

  const saveChoice = (choice: CookieConsentChoice) => {
    writeCookieConsent(choice);
    updateConsent(choice === "all" ? "granted" : "denied");
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-label="Cookie preferences"
      aria-live="polite"
      className="cookie-consent fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5"
    >
      <div className="mx-auto grid max-w-5xl gap-5 rounded-box border border-white/15 bg-nox-noir p-5 text-white sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 className="font-title text-xl font-bold text-golden-harvest">
            Your privacy, your choice.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Dokiments uses necessary browser storage to keep the site working
            and remember your choice. Optional cookies are used only with your
            permission. Read our{" "}
            <Link
              className="font-semibold text-white underline underline-offset-4"
              href="/cookies"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-96">
          <Button
            className="border-white/25 bg-white text-nox-noir hover:bg-white/90"
            onClick={() => saveChoice("necessary")}
            variant="outline"
          >
            Reject non-essential
          </Button>
          <Button
            className="border-white/25 bg-white text-nox-noir hover:bg-white/90"
            onClick={() => saveChoice("all")}
            variant="outline"
          >
            Accept all
          </Button>
        </div>
      </div>
    </section>
  );
};
