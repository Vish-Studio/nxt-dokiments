import {
  ArrowRight,
  DeviceMobile,
  FileText,
  MagnifyingGlass,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";

const documentCards = [
  { label: "Invoice", meta: "Net 30 / services", value: "$4,750" },
  { label: "Contract", meta: "Client agreement", value: "12 clauses" },
  { label: "Quotation", meta: "Project estimate", value: "Ready" },
];

const proofItems = [
  "Free to start",
  "Mobile responsive",
  "Invoices, contracts, quotations",
];

export const Hero = () => {
  return (
    <section
      className="relative flex min-h-screen overflow-hidden bg-nox-noir px-5 pt-24 pb-10 text-white sm:px-8 md:pt-28 md:pb-16 lg:px-10 lg:pt-24"
      id="top"
    >
      <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-black/70 to-transparent" />
      <div className="absolute left-1/2 top-24 h-72 w-[58rem] -translate-x-1/2 rounded-full bg-golden-harvest/12 blur-3xl website-drift" />
      <div className="absolute right-0 top-24 hidden h-px w-1/2 bg-linear-to-r from-transparent via-golden-harvest/30 to-transparent lg:block" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="website-hero-copy max-w-3xl">
          <h1 className="font-title text-4xl font-bold leading-[0.98] text-white sm:text-6xl lg:text-7xl">
            Business documents, ready before the work starts.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
            Dokiments is a polished marketplace for invoices, contracts,
            quotations, and the reusable documents that keep your business
            moving.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-9">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-box bg-golden-harvest px-6 py-4 font-title text-sm font-bold text-nox-noir shadow-soft transition-transform hover:-translate-y-1 hover:shadow-[0_22px_60px_rgb(255_208_102_/_0.24)]"
              href="/dashboard"
            >
              Sign up
              <ArrowRight aria-hidden size={18} weight="bold" />
            </a>
            <a
              className="inline-flex items-center justify-center rounded-box border border-white/18 px-6 py-4 font-title text-sm font-bold text-white transition-colors hover:border-golden-harvest hover:bg-white/8"
              href="#marketplace"
            >
              Browse marketplace
            </a>
          </div>

          <div className="website-hero-proof mt-9 grid gap-3 text-sm text-white/62 sm:grid-cols-3">
            {proofItems.map((item) => (
              <div className="flex items-center gap-2" key={item}>
                <span className="size-1.5 rounded-full bg-golden-harvest" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="website-hero-visual relative hidden min-h-[520px] md:block lg:min-h-[620px]">
          <div className="website-hero-sheen absolute inset-x-6 top-2 h-80 overflow-hidden rounded-[2rem] bg-golden-harvest website-float" />

          <div className="absolute right-0 top-14 w-[78%] rounded-[1.75rem] border border-white/10 bg-white p-5 text-nox-noir shadow-[0_28px_90px_rgb(0_0_0_/_0.38)] website-float-delayed">
            <div className="flex items-center justify-between border-b border-steel-mist pb-4">
              <span className="font-title text-lg font-bold">Template marketplace</span>
              <ShieldCheck aria-hidden className="text-nox-noir" size={24} weight="fill" />
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-box border border-steel-mist bg-base-200 px-4 py-3">
              <MagnifyingGlass aria-hidden className="text-nox-noir/55" size={18} weight="bold" />
              <span className="text-sm text-nox-noir/55">
                Search invoices, contracts, quotations
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {documentCards.map((card) => (
                <div
                  className="flex items-center justify-between rounded-box border border-steel-mist bg-white p-4 transition-transform duration-300 hover:-translate-x-1"
                  key={card.label}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-box bg-golden-harvest">
                      <FileText aria-hidden className="text-nox-noir" size={19} weight="bold" />
                    </span>
                    <span>
                      <span className="block font-title text-sm font-bold">{card.label}</span>
                      <span className="text-xs text-nox-noir/55">{card.meta}</span>
                    </span>
                  </span>
                  <span className="font-title text-sm font-bold text-nox-noir">
                    {card.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute left-0 top-32 w-[60%] rounded-[1.75rem] border border-steel-mist bg-white p-6 shadow-[0_28px_80px_rgb(0_0_0_/_0.24)] transition-transform duration-500 hover:-translate-y-2 hover:rotate-1">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded-full bg-nox-noir" />
              <span className="font-title text-xs font-bold text-nox-noir/45">PDF</span>
            </div>
            <div className="mt-7 grid gap-3">
              <div className="h-3 rounded-full bg-steel-mist/75" />
              <div className="h-3 w-4/5 rounded-full bg-steel-mist/75" />
              <div className="h-3 w-3/5 rounded-full bg-steel-mist/75" />
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3">
              <div className="rounded-box bg-golden-harvest p-4">
                <span className="block font-title text-sm font-bold text-nox-noir">
                  Invoice
                </span>
                <span className="text-xs text-nox-noir/65">Editable fields</span>
              </div>
              <div className="rounded-box bg-steel-mist/35 p-4">
                <span className="block font-title text-sm font-bold text-nox-noir">
                  Contract
                </span>
                <span className="text-xs text-nox-noir/55">Clause library</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-10 w-44 rounded-[1.5rem] border border-steel-mist bg-white p-3 shadow-[0_24px_70px_rgb(0_0_0_/_0.32)] transition-transform duration-500 hover:-translate-y-3">
            <div className="rounded-[1.1rem] bg-nox-noir p-4 text-white">
              <DeviceMobile aria-hidden className="text-golden-harvest" size={24} weight="bold" />
              <p className="mt-16 font-title text-lg font-bold leading-tight">
                Mobile ready documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
