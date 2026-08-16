"use client";

import { QuotesIcon, StarIcon } from "@phosphor-icons/react/dist/ssr";

import { Carousel } from "@/components/commons/carousel/carousel";

const testimonials = [
  {
    name: "Maya Chen",
    quote: "The workspace makes repeat document work feel far less scattered. I can return to the right template and get a polished draft moving quickly.",
    role: "Independent consultant",
  },
  {
    name: "Omar Williams",
    quote: "What stands out is the focus: find the template, save it, and turn it into a document without bouncing between tools.",
    role: "Operations lead",
  },
  {
    name: "Priya Nair",
    quote: "It gives our small team a more considered starting point for the business documents we create again and again.",
    role: "Studio founder",
  },
  {
    name: "Elijah Brooks",
    quote: "I spend less time rebuilding familiar documents and more time tailoring the details that actually matter for the client.",
    role: "Creative director",
  },
  {
    name: "Ana Martins",
    quote: "The templates give me confidence that a quotation or contract starts clean, clear, and ready for a professional conversation.",
    role: "Freelance producer",
  },
  {
    name: "Marcus Reed",
    quote: "It is a straightforward system for keeping the paperwork behind the business as organized as the work itself.",
    role: "Small business owner",
  },
  {
    name: "Sofia Alvarez",
    quote: "The focused workflow makes it easy to go from a solid template to a document that feels genuinely ours.",
    role: "Partnerships manager",
  },
];

export const Testimonials = () => {
  return (
    <section className="testimonials bg-play-blue px-5 py-24 text-nox-noir sm:px-8 lg:px-10" id="testimonials">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className="website-reveal">
            <p className="font-title text-sm font-bold uppercase tracking-wide text-nox-noir/58">Customer stories</p>
            <h2 className="mt-3 max-w-xl font-title text-4xl font-bold leading-tight sm:text-5xl">A more grounded way to begin important documents.</h2>
          </div>
          <p className="website-reveal max-w-2xl text-lg leading-8 text-nox-noir/68">From solo consultants to growing teams, Dokiments helps people put their repeat business documents on a clearer path.</p>
        </div>

        <Carousel
          ariaLabel="Customer testimonials"
          autoPlay
          className="mt-12"
          trackClassName="gap-0"
        >
          {testimonials.map((testimonial) => (
            <div className="testimonial-slide flex w-full shrink-0 px-2 sm:w-1/2 lg:w-1/3" key={testimonial.name}>
              <article className="testimonial-card flex min-h-72 w-full flex-col rounded-box border border-nox-noir/14 bg-white p-6">
                <QuotesIcon aria-hidden className="text-golden-harvest" size={34} weight="fill" />
                <blockquote className="mt-6 font-title text-xl font-semibold leading-8">“{testimonial.quote}”</blockquote>
                <div className="mt-auto border-t border-steel-mist pt-5">
                  <div aria-label="5 out of 5 stars" className="flex gap-1 text-golden-harvest">
                    {Array.from({ length: 5 }, (_, starIndex) => <StarIcon aria-hidden key={starIndex} size={15} weight="fill" />)}
                  </div>
                  <p className="mt-3 font-title text-base font-bold">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-nox-noir/60">{testimonial.role}</p>
                </div>
              </article>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};
