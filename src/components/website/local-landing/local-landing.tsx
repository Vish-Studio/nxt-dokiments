import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { ConversionCta } from "@/components/website/conversion-cta/conversion-cta";
import { FaqItem } from "@/components/website/faq-item/faq-item";
import { Footer } from "@/components/website/footer/footer";
import { Header } from "@/components/website/header/header";
import { SectionHeading } from "@/components/website/section-heading/section-heading";
import { ShowcaseDocument } from "@/components/website/showcase-document/showcase-document";
import type { LocalPage } from "@/lib/website/local-pages";

import { LocalPointCard } from "./local-point-card";

export interface LocalLandingProps {
  page: LocalPage;
}

const pointTones = [
  "bg-golden-harvest",
  "bg-play-blue",
  "bg-play-purple",
  "bg-play-pink",
];

/**
 * A public landing page for one market's searches, such as "invoicing in
 * Mauritius" (`/invoice-maker-mauritius`). Server-rendered, with the search
 * phrase as its only `h1`, so search engines read the whole page.
 *
 * Order: hero (heading, intro, sign-up, and a real invoice template filled
 * with a local example), the reasons it fits that market, the questions people
 * there ask, then the shared conversion banner and footer. The page's own
 * structured data is added by its route.
 */
export const LocalLanding = ({ page }: LocalLandingProps) => (
  <main className="local-landing min-h-screen bg-white text-nox-noir">
    <Header />

    <section className="px-5 pb-20 pt-32 sm:px-8 sm:pt-36 lg:px-10">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="font-title text-sm font-bold text-nox-noir/55">
            Dokiments for {page.country}
          </p>
          <h1 className="mt-3 font-title text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {page.heading}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-nox-noir/70">
            {page.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton
              analytics={{
                event: "cta_click",
                params: {
                  placement: `local-${page.countryCode.toLowerCase()}`,
                },
              }}
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
              href="/#workflow"
              size="lg"
              variant="outline"
            >
              See how it works
            </LinkButton>
          </div>
        </div>

        {/* A real invoice template, filled with a local example. */}
        <div
          aria-hidden
          className="relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden rounded-box bg-golden-harvest p-8 sm:p-10"
          inert
        >
          <ShowcaseDocument
            className="mx-auto w-full -rotate-2"
            templateId="classic-invoice"
            values={page.sampleInvoice}
          />
        </div>
      </div>
    </section>

    <section
      aria-labelledby="local-points"
      className="bg-base-200 px-5 py-20 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div id="local-points">
          <SectionHeading title={`Made for invoicing in ${page.country}`} />
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {page.points.map((point, index) => (
            <LocalPointCard
              body={point.body}
              key={point.title}
              title={point.title}
              tone={pointTones[index % pointTones.length]}
            />
          ))}
        </ul>
      </div>
    </section>

    <section className="px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <SectionHeading
          title={`Questions from businesses in ${page.country}`}
        />
        <div className="border-t border-steel-mist">
          {page.faqs.map((faq, index) => (
            <FaqItem
              answer={faq.answer}
              defaultOpen={index === 0}
              key={faq.question}
              question={faq.question}
            />
          ))}
        </div>
      </div>
    </section>

    <ConversionCta
      description="Free to start: unlimited documents, your clients saved, and a PDF ready to send."
      placement={`local-${page.countryCode.toLowerCase()}-bottom`}
      title={`Send your next invoice in ${page.country} today.`}
    />
    <Footer />
  </main>
);

export default LocalLanding;
