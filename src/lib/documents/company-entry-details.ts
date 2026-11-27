import { formatNumericDate } from "@/lib/documents/format-document-date";
import type { ShareRecipient } from "@/types/sharing";

import {
  type CompanyDocumentGroup,
  type CompanyEntry,
  getEntryStatus,
} from "./company-groups";

/** The number fields templates use, most common first. */
const numberKeys = [
  "invoiceNumber",
  "quoteNumber",
  "receiptNumber",
  "poNumber",
  "orderNumber",
  "changeNumber",
  "referenceNumber",
];

/**
 * The document's own number ("INV-0042", "Q-1042"), from whichever number
 * field its template has, or `""` when it has none or it is blank. Any other
 * `…Number` field counts too, after the known ones.
 */
export const getEntryNumber = (entry: CompanyEntry) => {
  const values = entry.document?.values ?? entry.shared?.values ?? {};
  const keys = [
    ...numberKeys,
    ...Object.keys(values).filter(
      (key) => /Number$/.test(key) && !numberKeys.includes(key),
    ),
  ];
  for (const key of keys) {
    const value = values[key]?.trim();
    if (value) return value;
  }
  return "";
};

/**
 * Who a document was exchanged with, for the "Shared with" column: the
 * recipient's email for a document the user shared, "From {sender}" for one
 * shared with the user, or `""` when it hasn't been shared (or access was
 * revoked from everyone).
 */
export const getEntryContact = (entry: CompanyEntry) => {
  if (entry.source === "received") return `From ${entry.sharedBy}`;
  const recipient: ShareRecipient | undefined = entry.recipient;
  return recipient && recipient.status !== "revoked" ? recipient.email : "";
};

/**
 * One short line saying what last happened to a document and when, under
 * its status pill. Who it was with lives in its own column
 * ({@link getEntryContact}):
 * - received: "Signed 19/11/26" once signed, else "Shared with you".
 * - signed: "Signed 19/11/26".
 * - viewed: "Opened, not signed yet".
 * - pending: "Sent 20/11/26".
 * - not shared: "Not sent yet".
 */
export const getEntryActivity = (entry: CompanyEntry) => {
  if (entry.source === "received") {
    const signedAt = Object.values(entry.shared?.signatures ?? {})[0]?.signedAt;
    return signedAt
      ? `Signed ${formatNumericDate(signedAt)}`
      : "Shared with you";
  }

  const recipient: ShareRecipient | undefined = entry.recipient;
  if (!recipient || recipient.status === "revoked") return "Not sent yet";
  if (recipient.status === "signed") {
    return recipient.signedAt
      ? `Signed ${formatNumericDate(recipient.signedAt)}`
      : "Signed";
  }
  if (recipient.status === "viewed") return "Opened, not signed yet";
  return `Sent ${formatNumericDate(recipient.invitedAt)}`;
};

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/**
 * The line under a company's name: how many documents, then only the
 * statuses worth acting on. "4 documents · 1 awaiting signature · 1 received".
 */
export const getCompanyGroupSummary = (group: CompanyDocumentGroup) => {
  const statuses = group.entries.map(getEntryStatus);
  // Viewed documents still wait for a signature.
  const awaiting = statuses.filter(
    (status) => status === "awaiting" || status === "viewed",
  ).length;
  const received = statuses.filter((status) => status === "received").length;

  return [
    plural(group.entries.length, "document", "documents"),
    awaiting ? `${awaiting} awaiting signature` : "",
    received ? `${received} received` : "",
  ]
    .filter(Boolean)
    .join(" · ");
};
