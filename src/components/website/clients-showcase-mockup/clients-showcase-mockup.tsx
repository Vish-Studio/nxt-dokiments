import {
  ArrowDown,
  CheckCircle,
  EnvelopeSimple,
  MapPin,
  Phone,
} from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const contactRows = [
  { icon: Phone, value: "+230 5523 3332" },
  { icon: EnvelopeSimple, value: "hello@global-express.com" },
  { icon: MapPin, value: "Port Louis, Mauritius" },
];

const prefilledFields = [
  { label: "Bill to", value: "Global Express Ltd" },
  { label: "Email", value: "hello@global-express.com" },
  { label: "Address", value: "Port Louis, Mauritius" },
];

// Illustrative only: a saved client card flowing into an invoice's prefilled recipient block.
export const ClientsShowcaseMockup = ({ className }: Props) => {
  return (
    <div
      aria-hidden
      className={cn(
        "clients-showcase-mockup website-reveal grid gap-3 rounded-box bg-play-blue p-6 sm:p-10",
        className,
      )}
    >
      <div className="rounded-box border border-nox-noir/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-golden-harvest font-title text-sm font-bold text-nox-noir">
            GE
          </span>
          <div>
            <p className="font-title text-base font-bold text-nox-noir">
              {prefilledFields[0].value}
            </p>
            <p className="text-xs text-nox-noir/55">Client · Business</p>
          </div>
        </div>
        <ul className="mt-4 grid gap-2">
          {contactRows.map(({ icon: RowIcon, value }) => (
            <li
              className="flex items-center gap-2 text-sm text-nox-noir/70"
              key={value}
            >
              <RowIcon
                className="shrink-0"
                size={16}
              />
              {value}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center">
        <span className="flex size-9 items-center justify-center rounded-full bg-nox-noir text-white">
          <ArrowDown
            size={16}
            weight="bold"
          />
        </span>
      </div>

      <div className="rounded-box border border-nox-noir/10 bg-white p-5">
        <div className="flex items-center justify-between gap-3 border-b border-steel-mist pb-3">
          <p className="font-title text-base font-bold text-nox-noir">
            Invoice INV-0042
          </p>
          <span className="flex items-center gap-1 text-xs font-semibold text-nox-noir/70">
            <CheckCircle
              className="text-success"
              size={16}
              weight="fill"
            />
            Prefilled
          </span>
        </div>
        <dl className="mt-3 grid gap-2">
          {prefilledFields.map((field) => (
            <div
              className="flex items-center justify-between gap-4 rounded-field bg-base-200 px-3 py-2 text-sm"
              key={field.label}
            >
              <dt className="text-nox-noir/55">{field.label}</dt>
              <dd className="font-semibold text-nox-noir">{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default ClientsShowcaseMockup;
