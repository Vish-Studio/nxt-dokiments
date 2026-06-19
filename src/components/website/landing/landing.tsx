import { Footer } from "@/components/website/footer/footer";
import { Header } from "@/components/website/header/header";
import { Hero } from "@/components/website/hero/hero";
import { Overview } from "@/components/website/overview/overview";
import { Pricing } from "@/components/website/pricing/pricing";
import { Workflow } from "@/components/website/workflow/workflow";

export const Landing = () => {
  return (
    <main className="min-h-screen bg-white text-nox-noir">
      <Header />
      <Hero />
      <section className="bg-white px-5 py-24 sm:px-8 lg:px-10" id="marketplace">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <h2 className="font-title text-4xl font-bold leading-tight text-nox-noir sm:text-5xl website-reveal">
            Marketplace shelves for the documents businesses ask for every week.
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {["Invoices", "Contracts", "Quotations"].map((item) => (
              <article
                className="min-h-48 rounded-box border border-steel-mist bg-base-100 p-5 transition-all duration-300 hover:-translate-y-2 hover:border-nox-noir hover:shadow-soft website-reveal"
                key={item}
              >
                <span className="font-title text-xl font-bold text-nox-noir">
                  {item}
                </span>
                <p className="mt-20 text-sm leading-6 text-nox-noir/60">
                  Ready-to-use layouts with clean structure, clear language, and
                  responsive previews.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Overview />
      <Workflow />
      <Pricing />
      <Footer />
    </main>
  );
};
