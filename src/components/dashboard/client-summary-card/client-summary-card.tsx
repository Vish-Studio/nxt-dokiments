import {
  EnvelopeSimpleIcon,
  IdentificationCardIcon,
  MapPinIcon,
  PhoneIcon,
} from "@phosphor-icons/react";

import { getClientAccentClass } from "@/lib/clients/clients";
import { cn, getInitials } from "@/lib/utils";
import type { Client } from "@/types/client";

interface Props {
  className?: string;
  client: Client;
}

// Read-only view of the saved client a document is addressed to, shown instead of the
// recipient inputs. Optional details the client doesn't have are simply left out.
export const ClientSummaryCard = ({ className, client }: Props) => {
  const title = client.companyName || client.name;
  const rows = [
    { icon: EnvelopeSimpleIcon, label: "Email", value: client.email },
    { icon: PhoneIcon, label: "Phone", value: client.phone },
    { icon: MapPinIcon, label: "Address", value: client.address },
    { icon: IdentificationCardIcon, label: "BRN", value: client.brn },
  ].filter((row) => row.value);

  return (
    <section
      aria-label={`Client: ${title}`}
      className={cn(
        "client-summary-card rounded-field border border-steel-mist bg-base-100 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full font-title text-sm font-bold text-nox-noir",
            getClientAccentClass(client.id),
          )}
        >
          {getInitials(title)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-title text-sm font-bold text-nox-noir">
            {title}
          </p>
          {client.companyName && client.name ? (
            <p className="truncate text-xs text-nox-noir/55">{client.name}</p>
          ) : null}
        </div>
      </div>
      {rows.length ? (
        <dl className="mt-4 grid gap-2 border-t border-steel-mist pt-3">
          {rows.map(({ icon: RowIcon, label, value }) => (
            <div
              className="flex min-w-0 items-start gap-2 text-sm"
              key={label}
            >
              <dt className="flex shrink-0 items-center pt-0.5 text-nox-noir/45">
                <RowIcon
                  aria-hidden
                  size={15}
                />
                <span className="sr-only">{label}</span>
              </dt>
              <dd className="min-w-0 break-words text-nox-noir/75">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
};

export default ClientSummaryCard;
