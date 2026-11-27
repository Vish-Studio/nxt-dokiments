import {
  EnvelopeSimpleIcon,
  PhoneIcon,
  PlusIcon,
  UserCircleDashedIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import { Avatar } from "@/components/commons/avatar/avatar";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { getAvatarColorClass } from "@/lib/clients/avatar-color";
import type { CompanyDocumentGroup } from "@/lib/documents/company-groups";
import { formatFullDate } from "@/lib/documents/format-document-date";
import { cn } from "@/lib/utils";

export interface CompanySummaryCardProps {
  className?: string;
  group: CompanyDocumentGroup;
  /** "New document" with this company prefilled. */
  newDocumentHref: string;
}

const contactLinkClassName =
  "flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-field bg-base-200 px-3 font-title text-sm font-semibold text-nox-noir transition-colors hover:bg-steel-mist/60";

/**
 * The phone version of a company page's details: one card that answers "who
 * is this and how do I reach them?" before the document list. Avatar, name and
 * contact person; Email / Call shortcuts; the black "New document" (company
 * prefilled); then the key facts as a compact label / value list. On desktop
 * the full "Client information" and "Company information" cards show instead.
 */
export const CompanySummaryCard = ({
  className,
  group,
  newDocumentHref,
}: CompanySummaryCardProps) => {
  const { client } = group;
  const name = group.name ?? "No client yet";
  const count = group.entries.length;
  const facts = [
    { label: "Documents", value: String(count) },
    { label: "Since", value: formatFullDate(group.firstAt) },
    { label: "BRN", value: client?.brn ?? "" },
    { label: "Address", value: client?.address ?? "" },
  ].filter((fact) => fact.value.trim());

  return (
    <section
      aria-label={`${name} details`}
      className={cn(
        "company-summary-card rounded-xl border border-steel-mist bg-base-100 p-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {group.name ? (
          <Avatar
            className={cn(
              getAvatarColorClass(client?.id ?? group.key),
              "text-nox-noir",
            )}
            name={name}
            size="md"
          />
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-steel-mist text-nox-noir/45">
            <UserCircleDashedIcon
              aria-hidden
              size={20}
              weight="bold"
            />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="break-words font-title text-lg font-bold leading-tight text-nox-noir">
            {name}
          </h2>
          <p className="mt-0.5 truncate text-xs text-nox-noir/55">
            {client?.name
              ? `Contact: ${client.name}`
              : group.name
                ? "Not in My Clients yet"
                : "Documents without a client"}
          </p>
        </div>
      </div>

      {client?.email || client?.phone ? (
        <div className="mt-4 flex gap-2">
          {client.email ? (
            <a
              className={contactLinkClassName}
              href={`mailto:${client.email}`}
            >
              <EnvelopeSimpleIcon
                aria-hidden
                size={16}
                weight="bold"
              />
              Email
            </a>
          ) : null}
          {client.phone ? (
            <a
              className={contactLinkClassName}
              href={`tel:${client.phone.replace(/\s+/g, "")}`}
            >
              <PhoneIcon
                aria-hidden
                size={16}
                weight="bold"
              />
              Call
            </a>
          ) : null}
        </div>
      ) : null}

      <LinkButton
        aria-label={`New document for ${name}`}
        className="mt-2 w-full"
        href={newDocumentHref}
        icon={
          <PlusIcon
            aria-hidden
            size={16}
            weight="bold"
          />
        }
        iconPosition="left"
        size="sm"
        variant="primary"
      >
        New document
      </LinkButton>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-steel-mist pt-4">
        {facts.map(({ label, value }) => (
          <div
            className={cn("min-w-0", label === "Address" && "col-span-2")}
            key={label}
          >
            <dt className="text-xs text-nox-noir/50">{label}</dt>
            <dd className="mt-0.5 whitespace-pre-line break-words text-sm font-semibold text-nox-noir">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {group.name ? (
        <Link
          className="mt-4 inline-flex text-xs font-semibold text-nox-noir underline underline-offset-4"
          href="/my-clients"
        >
          {client ? "View in My Clients" : "Add to My Clients"}
        </Link>
      ) : null}
    </section>
  );
};

export default CompanySummaryCard;
