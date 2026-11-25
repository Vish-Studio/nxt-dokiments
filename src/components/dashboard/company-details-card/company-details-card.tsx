import {
  BuildingsIcon,
  CalendarBlankIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
  type Icon,
  IdentificationBadgeIcon,
  IdentificationCardIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { formatFullDate } from "@/lib/documents/format-document-date";
import type { Client } from "@/types/client";

interface DetailRow {
  icon: Icon;
  label: string;
  value: string;
}

/** Shared shell: a titled white card in the dashboard style. */
const DetailsCard = ({
  children,
  className,
  description,
  title,
}: {
  children: ReactNode;
  className: string;
  description?: string;
  title: string;
}) => (
  <section
    aria-label={title}
    className={`${className} rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6`}
  >
    <h3 className="font-title text-xl font-bold text-nox-noir">{title}</h3>
    <p className="mt-1 text-sm leading-6 text-nox-noir/60">{description}</p>
    {children}
  </section>
);

/** Label / value pairs as grey rows with a white icon tile; empty values are skipped. */
const DetailList = ({ rows }: { rows: DetailRow[] }) => {
  const filled = rows.filter((row) => row.value.trim());
  if (filled.length === 0) return null;

  return (
    <dl className="mt-5 grid gap-2">
      {filled.map(({ icon: RowIcon, label, value }) => (
        <div
          className="flex min-w-0 items-start gap-3 rounded-box bg-base-200 p-3"
          key={label}
        >
          <dt className="flex size-9 shrink-0 items-center justify-center rounded-box bg-base-100 text-nox-noir/70">
            <RowIcon
              aria-hidden
              size={16}
              weight="bold"
            />
            <span className="sr-only">{label}</span>
          </dt>
          <dd className="min-w-0">
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
  );
};

export interface ClientInformationCardProps {
  /** The client-book record; omit for companies not in My Clients. */
  client?: Client;
  /** The company's name, used in the "not in My Clients" copy. */
  name: string | null;
}

/**
 * "Client information" on a company page: the person you deal with, from My
 * Clients (contact person, email, phone, national ID), and a link to the
 * record. Companies outside the client book get one sentence and "Add to My
 * Clients".
 */
export const ClientInformationCard = ({
  client,
  name,
}: ClientInformationCardProps) => (
  <DetailsCard
    className="client-information-card"
    description={
      client
        ? "Your contact, from My Clients. Filled in automatically on new documents."
        : name
          ? `${name} isn't in My Clients yet. Add it so its details fill in on new documents.`
          : "These documents don't name a client yet."
    }
    title="Client information"
  >
    {client ? (
      <DetailList
        rows={[
          { icon: UserIcon, label: "Contact person", value: client.name },
          { icon: EnvelopeSimpleIcon, label: "Email", value: client.email },
          { icon: PhoneIcon, label: "Phone", value: client.phone },
          {
            icon: IdentificationBadgeIcon,
            label: "National ID",
            value: client.nationalId,
          },
        ]}
      />
    ) : null}
    {name ? (
      <LinkButton
        className="mt-4 w-full sm:w-auto"
        href="/my-clients"
        icon={null}
        size="sm"
        variant="outline"
      >
        {client ? "View in My Clients" : "Add to My Clients"}
      </LinkButton>
    ) : null}
  </DetailsCard>
);

export interface CompanyInformationCardProps {
  client?: Client;
  /** Epoch-ms of the first document with this company. */
  firstAt: number;
  /** Epoch-ms of the latest document with this company. */
  latestAt: number;
  name: string | null;
}

/**
 * "Company information" on a company page: the business itself (name, BRN,
 * address from My Clients) plus when you started and last worked together,
 * from the documents.
 */
export const CompanyInformationCard = ({
  client,
  firstAt,
  latestAt,
  name,
}: CompanyInformationCardProps) => (
  <DetailsCard
    className="company-information-card"
    description="The business and how long you've worked together."
    title="Company information"
  >
    <DetailList
      rows={[
        {
          icon: BuildingsIcon,
          label: "Company",
          value: client?.companyName || name || "No client yet",
        },
        {
          icon: IdentificationCardIcon,
          label: "BRN",
          value: client?.brn ?? "",
        },
        { icon: MapPinIcon, label: "Address", value: client?.address ?? "" },
        {
          icon: CalendarBlankIcon,
          label: "First document",
          value: formatFullDate(firstAt),
        },
        {
          icon: ClockIcon,
          label: "Last activity",
          value: formatFullDate(latestAt),
        },
      ]}
    />
  </DetailsCard>
);
