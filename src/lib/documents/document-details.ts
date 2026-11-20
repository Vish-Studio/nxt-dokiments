import type { SharedDocument } from "@/types/sharing";
import type { UserDocument } from "@/types/template";

import {
  buildCompanyEntries,
  entryStatusLabels,
  getDocumentCompanyName,
  getEntryStatus,
} from "./company-groups";
import { formatNumericDateTime } from "./format-document-date";

/** One labelled fact about a document, as the preview panel shows it. */
export type DocumentDetail = {
  /** Short label ("Created", "Client"). */
  label: string;
  /** Display value, already formatted. */
  value: string;
};

/**
 * The facts a user checks before opening a document: who it is for, how much,
 * where it stands and when it was made. Shown in the "Document" tab of the
 * preview panel. Pure.
 *
 * Rows that would be empty are left out ("Amount" with no amount, "Last
 * edited" when it was never edited after creation).
 *
 * @param sharedByMe - The user's share records, so a shared document reads
 *   "Awaiting signature" or "Signed" rather than "Not shared".
 *
 * @example
 * getDocumentDetails(document, sharedByMe);
 * // [{ label: "Client", value: "Northline Studio" }, { label: "Amount", … }, …]
 */
export const getDocumentDetails = (
  document: UserDocument,
  sharedByMe: readonly SharedDocument[] = [],
): DocumentDetail[] => {
  const [entry] = buildCompanyEntries([document], [], sharedByMe);
  const edited = document.updatedAt - document.createdAt > 60_000;

  return [
    {
      label: "Client",
      value: getDocumentCompanyName(document) ?? "No client yet",
    },
    ...(entry.amount ? [{ label: "Amount", value: entry.amount }] : []),
    { label: "Status", value: entryStatusLabels[getEntryStatus(entry)] },
    { label: "Created", value: formatNumericDateTime(document.createdAt) },
    ...(edited
      ? [{ label: "Last edited", value: formatNumericDateTime(document.updatedAt) }]
      : []),
  ];
};
