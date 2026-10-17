"use client";

import { ArrowRight, SignIn } from "@phosphor-icons/react";

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
}

export const ConversionCta = ({
  className,
  description,
  eyebrow = "Ready when you are",
  placement,
  title,
}: ConversionCtaProps) => {
  const isAuthenticated = useAuthStore(
    (state) => state.status === "authenticated",
  );

  return (
    <section
      className={cn(
        "conversion-cta bg-white px-5 py-12 text-nox-noir sm:px-8 lg:px-10",
        className,
      )}
    >
      <div className="mx-auto grid max-w-7xl gap-8 rounded-box bg-golden-harvest p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:p-16">
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
        </div>

        <div className="grid gap-3 lg:min-w-64">
          {isAuthenticated ? (
            <LinkButton
              analytics={{ event: "cta_click", params: { placement } }}
              className="w-full"
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
              analytics={{ event: "cta_click", params: { placement } }}
              className="w-full"
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
          )}
        </div>
      </div>
    </section>
  );
};
