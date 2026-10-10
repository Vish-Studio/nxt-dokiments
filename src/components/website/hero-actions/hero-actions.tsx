"use client";

import { ArrowRight } from "@phosphor-icons/react";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface HeroActionsProps {
  className?: string;
}

export const HeroActions = ({ className }: HeroActionsProps) => {
  const isAuthenticated = useAuthStore(
    (state) => state.status === "authenticated",
  );

  return (
    <div
      className={cn(
        "hero-actions flex w-full flex-col justify-center gap-3 sm:flex-row lg:justify-start",
        className,
      )}
    >
      {isAuthenticated ? (
        <LinkButton
          className="w-full sm:w-auto"
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
        <>
          <LinkButton
            className="w-full sm:w-auto"
            href="/sign-up"
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
            Create a free account
          </LinkButton>

          <LinkButton
            className="w-full sm:w-auto"
            href="/sign-in"
            icon={
              <ArrowRight
                aria-hidden
                size={18}
                weight="bold"
              />
            }
            iconMotion="right"
            size="lg"
            variant="outline"
          >
            Sign In
          </LinkButton>
        </>
      )}
    </div>
  );
};
