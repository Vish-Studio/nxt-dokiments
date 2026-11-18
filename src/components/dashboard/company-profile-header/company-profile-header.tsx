import { PlusIcon, UserCircleDashedIcon } from "@phosphor-icons/react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { LinkButton } from "@/components/commons/link-button/link-button";
import type { CompanyDocumentGroup } from "@/lib/documents/company-groups";

export interface CompanyProfileHeaderProps {
  group: CompanyDocumentGroup;
  /** Where "New document" goes, with the client prefilled. */
  newDocumentHref: string;
}

/**
 * The intro card of a company page, in the dashboard's card style: avatar, the
 * company name as the page heading, one sentence saying what the page shows,
 * and the two actions (black "New document", outline "My Clients").
 */
export const CompanyProfileHeader = ({
  group,
  newDocumentHref,
}: CompanyProfileHeaderProps) => {
  const name = group.name ?? "No client yet";
  const description = group.name
    ? `Every document you've created for ${name} and everything ${name} has shared with you, in one place.`
    : "Documents that don't name a client yet. Pick a client in a document to move it to that company.";

  return (
    <section
      aria-label={`${name} overview`}
      className="company-profile-header rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-start gap-4 sm:items-center">
          {group.name ? (
            <Avatar
              className="bg-base-200 text-nox-noir"
              name={name}
              size="lg"
            />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-dashed border-steel-mist text-nox-noir/45">
              <UserCircleDashedIcon
                aria-hidden
                size={26}
                weight="bold"
              />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="break-words font-title text-2xl font-bold leading-tight text-nox-noir sm:truncate sm:text-3xl">
              {name}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-nox-noir/60">
              {description}
            </p>
          </div>
        </div>
        <div className="grid w-full gap-2 sm:flex sm:w-auto">
          {group.name ? (
            <LinkButton
              className="whitespace-nowrap"
              href="/my-clients"
              icon={null}
              size="sm"
              variant="outline"
            >
              {group.client ? "View in My Clients" : "Add to My Clients"}
            </LinkButton>
          ) : null}
          <LinkButton
            className="order-first whitespace-nowrap sm:order-none"
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
        </div>
      </div>
    </section>
  );
};

export default CompanyProfileHeader;
