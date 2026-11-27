import { StatusPill } from "@/components/commons/status-pill/status-pill";
import { entryStatusTone } from "@/lib/documents/entry-status-tone";
import {
  type EntryStatus,
  entryStatusLabels,
} from "@/lib/documents/company-groups";

export interface EntryStatusPillProps {
  /** From `getEntryStatus`. */
  status: EntryStatus;
}

/**
 * Where a document stands, as a dot + word `StatusPill`: "Awaiting
 * signature" (golden), "Viewed" (blue), "Signed" (green), "Received" (teal)
 * or "Not shared" (grey). Used by the company cards and the My documents /
 * CVs lists so a status reads the same everywhere.
 */
export const EntryStatusPill = ({ status }: EntryStatusPillProps) => (
  <span className="entry-status-pill inline-flex shrink-0">
    <StatusPill tone={entryStatusTone[status]}>
      {entryStatusLabels[status]}
    </StatusPill>
  </span>
);

export default EntryStatusPill;
