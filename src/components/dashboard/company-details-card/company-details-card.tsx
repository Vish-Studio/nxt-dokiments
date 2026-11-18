import {
  EnvelopeSimpleIcon,
  IdentificationCardIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { LinkButton } from "@/components/commons/link-button/link-button";
import type { Client } from "@/types/client";

export interface CompanyDetailsCardProps {
  /** The client-book record; omit for companies not in My Clients. */
  client?: Client;
  /** The company's name, used in the "not in My Clients" copy. */
  name: string | null;
}

/**
 * "Client details" on a company page, in the dashboard's card style: a titled
 * white card with a one-line explanation, then the client-book record as grey
 * rows (white icon tile, small label, value). Companies outside the client
 * book get one sentence and a link to add them.
 */
export const CompanyDetailsCard = ({ client, name }: CompanyDetailsCardProps) => {
  const rows = client
    ? [
        { icon: UserIcon, label: "Contact person", value: client.name },
        { icon: EnvelopeSimpleIcon, label: "Email", value: client.email },
        { icon: PhoneIcon, label: "Phone", value: client.phone },
        { icon: MapPinIcon, label: "Address", value: client.address },
        { icon: IdentificationCardIcon, label: "BRN", value: client.brn },
      ].filter((row) => row.value.trim())
    : [];

  return (
    <section
      aria-label="Client details"
      className="company-details-card rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6"
    >
      <h3 className="font-title text-xl font-bold text-nox-noir">
        Client details
      </h3>
      <p className="mt-1 text-sm leading-6 text-nox-noir/60">
        {client
          ? "From My Clients. Filled in automatically on new documents."
          : name
            ? `${name} isn't in My Clients yet. Add it so its details fill in on new documents.`
            : "These documents don't name a client yet."}
      </p>
      {client ? (
        <dl className="mt-5 grid gap-3">
          {rows.map(({ icon: RowIcon, label, value }) => (
            <div
              className="flex items-start gap-3 rounded-box bg-base-200 p-3"
              key={label}
            >
              <dt className="flex size-10 shrink-0 items-center justify-center rounded-box bg-base-100 text-nox-noir/70">
                <RowIcon
                  aria-hidden
                  size={18}
                  weight="bold"
                />
                <span className="sr-only">{label}</span>
              </dt>
              <dd className="min-w-0 pt-0.5">
                <span
                  aria-hidden
                  className="block text-xs text-nox-noir/50"
                >
                  {label}
                </span>
                <span className="block whitespace-pre-line break-words text-sm font-semibold text-nox-noir">
                  {value}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      ) : name ? (
        <LinkButton
          className="mt-4"
          href="/my-clients"
          icon={null}
          size="sm"
          variant="outline"
        >
          Go to My Clients
        </LinkButton>
      ) : null}
    </section>
  );
};

export default CompanyDetailsCard;
