import { FaqItem } from "@/components/website/faq-item/faq-item";
import { SectionHeading } from "@/components/website/section-heading/section-heading";
import { documentTypes } from "@/types/template";

const faqItems = [
  {
    answer:
      "Yes. Free accounts can browse templates, save a small starter library, and create documents before upgrading.",
    question: "Can I start without choosing a paid plan?",
  },
  {
    answer:
      "Sign in to keep templates attached to your account, continue drafts, and manage generated documents from the dashboard.",
    question: "Why should I sign in before browsing templates?",
  },
  {
    answer: `Dokiments has ${documentTypes.length} document types, including invoices, quotations, receipts, contracts, proposals, NDAs, purchase orders, and statements of work, each available in a growing collection of styles.`,
    question: "Which document types does Dokiments support?",
  },
  {
    answer:
      "An invoice asks for payment once the work is done. A quotation gives the client a price before work starts. Dokiments has templates for both.",
    question: "What is the difference between an invoice and a quotation?",
  },
  {
    answer:
      "Yes. Templates are designed around guided fields, so you can edit the details and preview the document before exporting.",
    question: "Can I customize a template after saving it?",
  },
  {
    answer:
      "Yes. Once a document looks right, export it as a PDF and send it to your client.",
    question: "Can I download my document?",
  },
  {
    answer:
      "Plan roles control access to template tiers and workspace capabilities. You can start free and upgrade as your library grows.",
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
    <section
      className="faq bg-white px-5 py-24 text-nox-noir sm:px-8 lg:px-10"
      id="faq"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <SectionHeading
          description="Dokiments is built for repeat document work. Sign in once, save the templates that fit, and come back to the same workspace when the next document is due."
          eyebrow="FAQ"
          highlight="answered."
          title="Questions, answered."
        />

        <div className="border-t border-steel-mist">
          {faqItems.map((item, index) => (
            <FaqItem
              answer={item.answer}
              defaultOpen={index === 0}
              key={item.question}
              question={item.question}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
