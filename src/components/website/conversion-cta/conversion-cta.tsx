import { SignIn } from "@phosphor-icons/react/dist/ssr";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { cn } from "@/lib/utils";

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
  return (
    <section
      className={cn(
        "conversion-cta bg-nox-noir px-5 py-14 text-white sm:px-8 lg:px-10",
        className,
      )}
    >
      <div className="mx-auto grid max-w-7xl gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-title text-sm font-bold uppercase tracking-wide text-golden-harvest">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl font-title text-3xl font-bold leading-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/64">
            {description}
          </p>
        </div>

        <div className="grid gap-3 lg:min-w-64">
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
            variant="accent"
          >
            Sign in
          </LinkButton>
        </div>
      </div>
    </section>
  );
};
