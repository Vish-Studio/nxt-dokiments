import { FaqItem } from "@/components/website/faq-item/faq-item";
import { SectionHeading } from "@/components/website/section-heading/section-heading";
import { faqItems } from "@/components/website/faq/faq-items";

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
