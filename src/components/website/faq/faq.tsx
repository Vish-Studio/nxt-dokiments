import { CaretDown } from "@phosphor-icons/react/dist/ssr";

const faqItems = [
  {
    answer: "Yes. Free accounts can browse templates, save a small starter library, and create documents before upgrading.",
    question: "Can I start without choosing a paid plan?",
  },
  {
    answer: "Sign in to keep templates attached to your account, continue drafts, and manage generated documents from the dashboard.",
    question: "Why should I sign in before browsing templates?",
  },
  {
    answer: "Dokiments currently focuses on invoices, contracts, quotations, proposals, NDAs, and operational business documents.",
    question: "Which document types does Dokiments support?",
  },
  {
    answer: "Yes. Templates are designed around guided fields, so you can edit the details and preview the document before exporting.",
    question: "Can I customize a template after saving it?",
  },
  {
    answer: "Plan roles control access to template tiers and workspace capabilities. You can start free and upgrade as your library grows.",
    question: "How do plan roles work?",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const Faq = () => {
  return (
    <section className="faq bg-white px-5 py-24 text-nox-noir sm:px-8 lg:px-10" id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="website-reveal">
          <p className="font-title text-sm font-bold uppercase tracking-wide text-nox-noir/55">
            FAQ
          </p>
          <h2 className="mt-3 font-title text-4xl font-bold leading-tight sm:text-5xl">
            Questions people ask before signing in.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-nox-noir/64">
            Dokiments is built for repeat document work: sign in once, save the templates that fit, and return to the same workspace when the next document is due.
          </p>
        </div>

        <div className="grid gap-3">
          {faqItems.map((item, index) => (
            <details
              className="group rounded-box bg-base-200 p-5 transition-colors open:bg-golden-harvest"
              key={item.question}
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-title text-xl font-bold">
                <span>{item.question}</span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-box bg-nox-noir text-golden-harvest transition-transform group-open:rotate-180">
                  <CaretDown aria-hidden size={18} weight="bold" />
                </span>
              </summary>
              <p className="mt-4 text-sm leading-6 text-nox-noir/68">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
