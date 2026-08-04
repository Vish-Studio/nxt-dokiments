import { CookieConsent } from "@/components/website/cookie-consent/cookie-consent";
import { Footer } from "@/components/website/footer/footer";
import { Header } from "@/components/website/header/header";

export interface LegalPageSection {
  bullets?: string[];
  paragraphs: string[];
  title: string;
}

export interface LegalPageProps {
  description: string;
  sections: LegalPageSection[];
  title: string;
  updatedAt: string;
}

export const LegalPage = ({ description, sections, title, updatedAt }: LegalPageProps) => {
  return (
    <main className="legal-page min-h-screen bg-white text-nox-noir">
      <Header />

      <article className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8 sm:pt-36 lg:px-10">
        <header className="border-b border-steel-mist pb-10">
          <p className="font-title text-sm font-bold text-nox-noir/50">Last updated {updatedAt}</p>
          <h1 className="mt-4 font-title text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-nox-noir/65">{description}</p>
        </header>

        <div className="mt-12 grid gap-10">
          {sections.map((section) => (
            <section className="border-b border-steel-mist/70 pb-10 last:border-b-0" key={section.title}>
              <h2 className="font-title text-2xl font-bold">{section.title}</h2>
              <div className="mt-4 grid gap-4 text-base leading-7 text-nox-noir/68">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="grid list-disc gap-2 pl-5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </article>

      <Footer />
      <CookieConsent />
    </main>
  );
};
