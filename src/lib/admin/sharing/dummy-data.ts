import { daysAgo } from "@/lib/admin/sample-data";
import type { ShareActivityStatus } from "@/lib/admin/sharing/share-status";

/**
 * Sample shared documents for the Sharing pages.
 *
 * `sharedDocuments/{id}` is readable only by its owner and recipients, so a
 * superadmin cannot list them. Replace `listSampleShares`/`getSampleShare`
 * once a superadmin read rule is agreed (it would expose signatures and field
 * values, so it needs a security review first).
 */

/** One recipient of a shared document. */
export type SampleShareRecipient = {
  email: string;
  /** How many times they opened the link. */
  opens: number;
  role: "Copy" | "Signer";
  status: ShareActivityStatus;
};

/** One event on a share's timeline, oldest first. */
export type SampleShareEvent = {
  /** Epoch milliseconds. */
  at: number;
  label: string;
};

export type SampleShare = {
  /** Epoch milliseconds the link stops working, or `null` for no expiry. */
  expiresAt: number | null;
  id: string;
  kind: "Signature request" | "View link";
  name: string;
  ownerEmail: string;
  ownerName: string;
  recipients: SampleShareRecipient[];
  remindersSent: number;
  /** Epoch milliseconds the share was created. */
  sentAt: number;
  status: ShareActivityStatus;
  timeline: SampleShareEvent[];
  type: string;
};

const shares: SampleShare[] = [
  {
    expiresAt: daysAgo(-7),
    id: "sh_41Rk9PzQ",
    kind: "Signature request",
    name: "Invoice INV-2026-0412",
    ownerEmail: "maya@laurent.test",
    ownerName: "Maya Laurent",
    recipients: [
      { email: "accounts@northwind.test", opens: 3, role: "Signer", status: "awaiting" },
      { email: "finance@northwind.test", opens: 1, role: "Copy", status: "received" },
    ],
    remindersSent: 1,
    sentAt: daysAgo(0, 1),
    status: "awaiting",
    timeline: [
      { at: daysAgo(0, 1.25), label: "Created from Classic invoice" },
      { at: daysAgo(0, 1), label: "Signature request sent to 2 recipients" },
      { at: daysAgo(0, 0.2), label: "Opened by accounts@northwind.test" },
    ],
    type: "Invoice",
  },
  {
    expiresAt: null,
    id: "sh_8nQ2LmWv",
    kind: "Signature request",
    name: "Freelance contract, Q1",
    ownerEmail: "maya@laurent.test",
    ownerName: "Maya Laurent",
    recipients: [
      { email: "ops@harbour.test", opens: 2, role: "Signer", status: "signed" },
      { email: "legal@harbour.test", opens: 1, role: "Signer", status: "signed" },
    ],
    remindersSent: 0,
    sentAt: daysAgo(7),
    status: "signed",
    timeline: [
      { at: daysAgo(7), label: "Signature request sent to 2 recipients" },
      { at: daysAgo(6), label: "Signed by ops@harbour.test" },
      { at: daysAgo(5), label: "Signed by legal@harbour.test" },
    ],
    type: "Contract",
  },
  {
    expiresAt: daysAgo(-29),
    id: "sh_Qa7Tp3Hd",
    kind: "View link",
    name: "Quotation Q-1180",
    ownerEmail: "sofia@brandt.test",
    ownerName: "Sofia Brandt",
    recipients: [{ email: "jo@harbour.test", opens: 4, role: "Copy", status: "received" }],
    remindersSent: 0,
    sentAt: daysAgo(1),
    status: "received",
    timeline: [
      { at: daysAgo(1), label: "View link sent" },
      { at: daysAgo(0, 20), label: "Opened by jo@harbour.test" },
    ],
    type: "Quotation",
  },
  {
    expiresAt: daysAgo(-1),
    id: "sh_Vb5Rk1Yo",
    kind: "Signature request",
    name: "Mutual NDA, Atlas",
    ownerEmail: "hana@sato.test",
    ownerName: "Hana Sato",
    recipients: [{ email: "legal@atlas.test", opens: 0, role: "Signer", status: "awaiting" }],
    remindersSent: 2,
    sentAt: daysAgo(4),
    status: "awaiting",
    timeline: [
      { at: daysAgo(4), label: "Signature request sent" },
      { at: daysAgo(2), label: "Reminder sent automatically" },
    ],
    type: "NDA",
  },
  {
    expiresAt: daysAgo(11),
    id: "sh_Lp0Xc8Ne",
    kind: "Signature request",
    name: "Scope of Work, rebrand",
    ownerEmail: "priya@nair.test",
    ownerName: "Priya Nair",
    recipients: [{ email: "ceo@lumen.test", opens: 1, role: "Signer", status: "expired" }],
    remindersSent: 3,
    sentAt: daysAgo(18),
    status: "expired",
    timeline: [
      { at: daysAgo(18), label: "Signature request sent" },
      { at: daysAgo(11), label: "Link expired unsigned" },
    ],
    type: "Scope of Work",
  },
];

/** Sample shares, newest first. Swap for a Firestore read when the rule exists. */
export const listSampleShares = (): SampleShare[] =>
  [...shares].sort((a, b) => b.sentAt - a.sentAt);

/**
 * One sample share by ID.
 *
 * @returns The share, or `undefined` when no sample has that ID (the page shows a 404).
 */
export const getSampleShare = (id: string): SampleShare | undefined =>
  shares.find((share) => share.id === id);

/** Sample sharing totals for the last 30 days. */
export const getSampleShareTotals = () => ({
  awaiting: 642,
  expired: 118,
  shared: 5_310,
  signed: 2_772,
});
