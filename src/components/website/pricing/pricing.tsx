import { Check } from "@phosphor-icons/react/dist/ssr";

const plans = [
  {
    description: "For individuals who need polished templates quickly.",
    name: "Starter",
    price: "Free",
    features: ["Browse free templates", "Mobile responsive previews", "Basic exports"],
  },
  {
    description: "For growing teams that reuse documents every week.",
    name: "Studio",
    price: "$12",
    features: ["Full template marketplace", "Saved favorites", "Team sharing"],
  },
  {
    description: "For businesses that need control, consistency, and scale.",
    name: "Business",
    price: "$29",
    features: ["Workspace libraries", "Advanced document sets", "Priority support"],
  },
];

export const Pricing = () => {
  return (
    <section className="bg-golden-harvest px-5 py-24 sm:px-8 lg:px-10" id="pricing">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl website-reveal">
          <h2 className="font-title text-4xl font-bold leading-tight text-nox-noir sm:text-5xl">
            Start free. Upgrade when documents become part of your operating system.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              className="flex min-h-[360px] flex-col rounded-box border border-nox-noir/20 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-3 hover:border-nox-noir website-reveal"
              key={plan.name}
            >
              <h3 className="font-title text-2xl font-bold text-nox-noir">{plan.name}</h3>
              <p className="mt-3 text-sm leading-6 text-nox-noir/65">{plan.description}</p>
              <div className="mt-8 font-title text-5xl font-bold text-nox-noir">
                {plan.price}
                {plan.price.startsWith("$") ? (
                  <span className="text-base text-nox-noir/55">/mo</span>
                ) : null}
              </div>
              <ul className="mt-8 grid gap-3">
                {plan.features.map((feature) => (
                  <li className="flex items-center gap-3 text-sm text-nox-noir/70" key={feature}>
                    <Check aria-hidden className="text-nox-noir" size={18} weight="bold" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                className="mt-auto inline-flex justify-center rounded-box bg-nox-noir px-5 py-3 font-title text-sm font-bold text-golden-harvest transition-transform hover:-translate-y-1"
                href="/dashboard"
              >
                Sign up
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
