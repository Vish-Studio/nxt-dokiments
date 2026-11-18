"use client";

import {
  ArrowRightIcon,
  PlusIcon,
  UserCircleDashedIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useId } from "react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { getAvatarColorClass } from "@/lib/clients/avatar-color";
import {
  type CompanyDocumentGroup,
  countEntriesByType,
  countSignatureStatus,
} from "@/lib/documents/company-groups";
import { companyNewDocumentHref } from "@/lib/documents/company-page-href";
import { formatRelativeDate } from "@/lib/documents/format-document-date";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import { cn } from "@/lib/utils";

export interface CompanyDocumentsCardProps {
  group: CompanyDocumentGroup;
  /** The company page, e.g. `/my-documents/companies/client-123`. */
  href: string;
}

/** Card shell, shared with `CompanyDocumentsGridSkeleton`: the My Clients surface, at content height. */
export const companyDocumentsCardClassName =
  "flex w-full flex-col rounded-box border border-steel-mist bg-base-100 p-4";

const pluralize = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

/** A bold number followed by a muted word: "**5** documents". */
const Figure = ({ count, word }: { count: number; word: string }) => (
  <span>
    <span className="font-semibold text-nox-noir">{count}</span>{" "}
    {pluralize(count, word).replace(/^\d+ /, "")}
  </span>
);

/**
 * One company on the My Documents "Companies" tab, kept compact:
 *
 * - header: avatar, name and who you deal with ("Contact: Maya Chen", "Not in
 *   My Clients", "Documents without a client"); top right, a quiet "+" that
 *   starts a new document with this company filled in;
 * - one line of figures: "5 documents · 1 signed · 0 awaiting" (with sharing
 *   off, where signatures are always 0: "5 documents · 3 types");
 * - footer on a hairline: "Latest {title}", its date and an arrow.
 *
 * The whole card opens the company page (an empty "View company {name}" link
 * covers it; "+" sits above). No hover background: the arrow and cursor say
 * it is clickable. The "No client yet" group gets a dashed avatar and border
 * and no "+".
 */
export const CompanyDocumentsCard = ({
  group,
  href,
}: CompanyDocumentsCardProps) => {
  const headingId = useId();
  const isNoClient = group.name === null;
  const name = group.name ?? "No client yet";
  const count = group.entries.length;
  const latest = group.entries[0];
  const { awaiting, signed } = countSignatureStatus(group.entries);
  const typeCount = countEntriesByType(group.entries).length;
  const subtitle = group.client?.name
    ? `Contact: ${group.client.name}`
    : isNoClient
      ? "Documents without a client"
      : "Not in My Clients";

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "company-documents-card group relative",
        companyDocumentsCardClassName,
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-nox-noir",
        isNoClient && "border-dashed",
      )}
    >
      {/* Whole-card target, painted over the content; "+" sits above it. */}
      <Link
        aria-label={`View company ${name}`}
        className="absolute inset-0 rounded-box outline-none"
        href={href}
      />

      <div className="flex min-w-0 items-center gap-3">
        {isNoClient ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-steel-mist text-nox-noir/45">
            <UserCircleDashedIcon
              aria-hidden
              size={20}
              weight="bold"
            />
          </span>
        ) : (
          <Avatar
            className={cn(
              getAvatarColorClass(group.client?.id ?? group.key),
              "text-nox-noir",
            )}
            name={name}
            size="md"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3
            className="truncate font-title text-sm font-bold text-nox-noir"
            id={headingId}
          >
            {name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-nox-noir/50">{subtitle}</p>
        </div>
        {isNoClient ? null : (
          <Link
            aria-label={`New document for ${name}`}
            className="relative z-10 grid size-8 shrink-0 place-items-center rounded-field bg-base-200 text-nox-noir transition-colors hover:bg-nox-noir hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-noir"
            href={companyNewDocumentHref(group)}
            title="New document"
          >
            <PlusIcon
              aria-hidden
              size={16}
              weight="bold"
            />
          </Link>
        )}
      </div>

      <p
        className="mb-3 mt-3 truncate text-xs text-nox-noir/55"
        data-testid="company-figures"
      >
        <Figure
          count={count}
          word="document"
        />
        {documentSharingEnabled ? (
          <>
            {" · "}
            <span>
              <span className="font-semibold text-nox-noir">{signed}</span>{" "}
              signed
            </span>
            {" · "}
            <span>
              <span className="font-semibold text-nox-noir">{awaiting}</span>{" "}
              awaiting
            </span>
          </>
        ) : (
          <>
            {" · "}
            <Figure
              count={typeCount}
              word="type"
            />
          </>
        )}
      </p>

      <div className="mt-auto flex items-center gap-2 border-t border-steel-mist/70 pt-2.5">
        <p className="min-w-0 flex-1 truncate text-xs text-nox-noir/55">
          Latest{" "}
          <span className="font-semibold text-nox-noir">{latest?.title}</span>
        </p>
        {latest ? (
          <span className="shrink-0 text-xs text-nox-noir/45">
            {formatRelativeDate(latest.createdAt)}
          </span>
        ) : null}
        <ArrowRightIcon
          aria-hidden
          className="shrink-0 text-nox-noir/50 transition-transform group-hover:translate-x-0.5 group-hover:text-nox-noir"
          size={14}
          weight="bold"
        />
      </div>
    </article>
  );
};

export default CompanyDocumentsCard;
