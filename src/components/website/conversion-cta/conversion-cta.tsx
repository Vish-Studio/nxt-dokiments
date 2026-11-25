"use client";

import { ArrowRight, SignIn } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface ConversionCtaProps {
  className?: string;
  description: string;
  eyebrow?: string;
  /** Identifies which landing-page instance this is, for the `cta_click` event. */
  placement: string;
  title: string;
  /**
   * An illustration for the right side (for example `ConversionCtaDocuments`).
   * With it, the buttons move under the text and signed-out visitors also get
   * "Create a free account". Without it (default), the plain banner with the
   * button on the right.
   *
   * A slot rather than a flag: this is a client component, and rendering the
   * illustration on the server keeps the template catalog out of the bundle.
   */
  visual?: ReactNode;
}

export const ConversionCta = ({
  className,
  description,
  eyebrow = "Ready when you are",
  placement,
  title,
  visual,
}: ConversionCtaProps) => {
  const hasVisual = visual !== undefined;
  const isAuthenticated = useAuthStore(
    (state) => state.status === "authenticated",
  );
  const analytics = { event: "cta_click" as const, params: { placement } };

  const primaryAction = isAuthenticated ? (
    <LinkButton
      analytics={analytics}
      className={hasVisual ? undefined : "w-full"}
      href="/dashboard"
      icon={
        <ArrowRight
          aria-hidden
          size={18}
          weight="bold"
        />
      }
      iconMotion="right"
      size="lg"
      variant="primary"
    >
      Go to my dashboard
    </LinkButton>
  ) : (
    <LinkButton
      analytics={analytics}
      className={hasVisual ? undefined : "w-full"}
      href="/sign-in"
      icon={
        <SignIn
          aria-hidden
          size={18}
          weight="bold"
        />
      }
      size="lg"
      variant="primary"
    >
      Sign in
    </LinkButton>
  );

  return (
    <section
      className={cn(
        "conversion-cta bg-white px-5 py-12 text-nox-noir sm:px-8 lg:px-10",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto grid max-w-7xl gap-8 rounded-box bg-golden-harvest p-8 sm:p-12 lg:items-center lg:p-16",
          hasVisual
            ? "relative overflow-hidden lg:grid-cols-[1fr_minmax(0,26rem)]"
            : "lg:grid-cols-[1fr_auto]",
        )}
      >
        <div>
          <p className="font-title text-sm font-bold uppercase tracking-wide text-nox-noir/60">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl font-title text-3xl font-bold leading-tight tracking-tight text-nox-noir sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-nox-noir/72">
            {description}
          </p>
          {hasVisual ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryAction}
              {isAuthenticated ? null : (
                <LinkButton
                  analytics={analytics}
                  className="border-transparent bg-white hover:bg-white/80"
                  href="/sign-up"
                  size="lg"
                  variant="outline"
                >
                  Create a free account
                </LinkButton>
              )}
            </div>
          ) : null}
        </div>

        {hasVisual ? (
          visual
        ) : (
          <div className="grid gap-3 lg:min-w-64">{primaryAction}</div>
        )}
      </div>
    </section>
  );
};
