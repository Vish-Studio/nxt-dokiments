"use client";

import { useState } from "react";

import { SectionHeading } from "@/components/website/section-heading/section-heading";
import { TestimonialPersonButton } from "@/components/website/testimonial-person-button/testimonial-person-button";
import { TestimonialQuote } from "@/components/website/testimonial-quote/testimonial-quote";
import { testimonials } from "@/components/website/testimonials/testimonials-data";

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const showNext = () =>
    setActiveIndex((current) => (current + 1) % testimonials.length);

  return (
    <section
      className="testimonials bg-nox-noir px-5 py-24 text-white sm:px-8 lg:px-10"
      id="testimonials"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          align="center"
          description="From solo consultants to small studios, Dokiments helps people put their repeat business documents on a clearer path."
          eyebrow="Customer stories"
          highlight="important documents."
          title="A more grounded way to begin important documents."
          tone="dark"
        />

        <div
          aria-label="Customer testimonials"
          className="testimonials-region mt-14 grid gap-4 lg:grid-cols-[1.5fr_1fr]"
          role="region"
        >
          <div className="grid">
            {testimonials.map((testimonial, index) => (
              <TestimonialQuote
                accent={testimonial.accent}
                isActive={index === activeIndex}
                key={testimonial.id}
                name={testimonial.name}
                quote={testimonial.quote}
                role={testimonial.role}
              />
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {testimonials.map((testimonial, index) => (
              <TestimonialPersonButton
                accent={testimonial.accent}
                isActive={index === activeIndex}
                key={testimonial.id}
                name={testimonial.name}
                onProgressEnd={showNext}
                onSelect={() => setActiveIndex(index)}
                role={testimonial.role}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
