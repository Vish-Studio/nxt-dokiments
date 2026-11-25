import {
  type EntryStatus,
  entryStatusLabels,
} from "@/lib/documents/company-groups";
import { cn } from "@/lib/utils";

export interface EntryStatusPillProps {
  /** From `getEntryStatus`. */
  status: EntryStatus;
}

/** Awaiting = golden, Signed = green, Received = teal, Not shared = grey. */
const statusClassName: Record<EntryStatus, string> = {
  awaiting: "bg-golden-harvest/45 text-nox-noir",
  "not-shared": "bg-base-200 text-nox-noir/65",
  received: "bg-play-teal/35 text-nox-noir",
  signed: "bg-success/15 text-success",
};

/**
 * Where a document stands, as a small coloured pill: "Awaiting signature",
 * "Signed", "Received" or "Not shared". Used by the company groups and the
 * My documents / CVs lists so a status reads the same everywhere.
 */
export const EntryStatusPill = ({ status }: EntryStatusPillProps) => (
  <span
    className={cn(
      "entry-status-pill inline-flex h-6 shrink-0 items-center rounded-field px-2 text-xs font-semibold whitespace-nowrap",
      statusClassName[status],
    )}
  >
    {entryStatusLabels[status]}
  </span>
);
