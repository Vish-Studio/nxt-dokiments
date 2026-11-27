import { currentRecipient } from "@/lib/sharing/share-activity";
import type { Client } from "@/types/client";
import type {
  ShareRecipient,
  ShareRecipientStatus,
  SharedDocument,
} from "@/types/sharing";
import type { DocumentType, UserDocument } from "@/types/template";

import { getDocumentAmount } from "./document-amount";

/** Group key for created documents that name no client yet. Always sorted last. */
export const NO_CLIENT_GROUP_KEY = "no-client";

/**
 * One document in a company's history, from either direction.
 *
 * - `created`: a document the user made for this company (`document` is set).
 *   `shareStatus` is set when the user shared it, from the share record.
 * - `received`: a document this company shared with the user (`shared` is set).
 */
export type CompanyEntry = {
  /** Headline amount ("1,250.00", "Rs 10,000"), empty when there is none. */
  amount: string;
  createdAt: number;
  documentType?: DocumentType;
  /** Unique across both sources: `doc:<id>` or `shared:<id>`. */
  id: string;
  source: "created" | "received";
  title: string;
  document?: UserDocument;
  shared?: SharedDocument;
  /** Who shared it, for `received` entries. */
  sharedBy?: string;
  /** The share's status when a `created` document was shared out. */
  shareStatus?: ShareRecipientStatus;
  /** Who a `created` document was shared with, and when it was sent or signed. */
  recipient?: ShareRecipient;
  /** Epoch ms of the last change, for the "Updated" column. */
  updatedAt: number;
};

/** One company (client) and everything exchanged with it. */
export type CompanyDocumentGroup = {
  /**
   * URL-safe, stable key: `client-<id>` for client-book companies, `name-<slug>`
   * for others, or {@link NO_CLIENT_GROUP_KEY}. Used in
   * `/my-documents/companies/[key]`.
   */
  key: string;
  /** Display name; `null` for the "No client yet" group. */
  name: string | null;
  /** The client-book record this company matches, when there is one. */
  client?: Client;
  /** Newest first. Never empty. */
  entries: CompanyEntry[];
  createdCount: number;
  receivedCount: number;
  /** Epoch ms of the newest entry. */
  latestAt: number;
  /** Epoch ms of the oldest entry. */
  firstAt: number;
};

/** How companies are ordered, mirroring the toolbar's sort. */
export type CompanyGroupSort = "name" | "newest" | "oldest";

const normalise = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

const slugify = (value: string) =>
  normalise(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "company";

/**
 * The company or person a created document is addressed to: the client block's
 * name (`toName`) or the NDA receiving party (`partyTwo`), the keys
 * `clientPrefillValues` fills from a client record.
 *
 * @returns The trimmed name, or `null` when the document names no client.
 */
export const getDocumentCompanyName = (document: UserDocument) =>
  document.values.toName?.trim() || document.values.partyTwo?.trim() || null;

/**
 * The company that shared a document with the user: the sender block's name
 * (`fromName` / NDA `partyOne`), falling back to the owner's account name.
 */
export const getSharedCompanyName = (shared: SharedDocument) =>
  shared.values.fromName?.trim() ||
  shared.values.partyOne?.trim() ||
  shared.ownerName.trim() ||
  shared.ownerEmail;

/**
 * Turns the user's documents and the documents shared with them into history
 * entries. A created document carries the status of its share, if any.
 *
 * @param sharedByMe - Share records of the user's own documents, matched on
 *   `sourceDocumentId`.
 */
export const buildCompanyEntries = (
  documents: readonly UserDocument[],
  sharedWithMe: readonly SharedDocument[] = [],
  sharedByMe: readonly SharedDocument[] = [],
): CompanyEntry[] => {
  const shareBySource = new Map(
    sharedByMe.map((shared) => [shared.sourceDocumentId, shared]),
  );

  return [
    ...documents.map((document): CompanyEntry => {
      const share = shareBySource.get(document.id);
      return {
        amount: getDocumentAmount(document.values),
        createdAt: document.createdAt,
        document,
        documentType: document.templateSnapshot?.documentType,
        id: `doc:${document.id}`,
        recipient: share ? currentRecipient(share) : undefined,
        shareStatus: share ? currentRecipient(share)?.status : undefined,
        source: "created",
        title: document.values.title?.trim() || document.name,
        updatedAt: Math.max(document.updatedAt, share?.updatedAt ?? 0),
      };
    }),
    ...sharedWithMe.map((shared): CompanyEntry => ({
      amount: getDocumentAmount(shared.values),
      createdAt: shared.createdAt,
      documentType: shared.templateSnapshot?.documentType,
      id: `shared:${shared.id}`,
      shared,
      sharedBy: shared.ownerName || shared.ownerEmail,
      source: "received",
      title: shared.values.title?.trim() || shared.name,
      updatedAt: shared.updatedAt,
    })),
  ];
};

/**
 * Groups history entries by company, newest first within each group.
 *
 * An entry joins a client-book record when its company name matches the
 * client's company or person name (case and spacing ignored), or its email
 * matches the client's (`toEmail` for created documents, the owner's email for
 * received ones). Otherwise it groups by name. Created documents without a
 * client name go into one {@link NO_CLIENT_GROUP_KEY} group. Pure.
 *
 * @returns One group per company, unsorted; use {@link sortCompanyGroups}.
 */
export const groupEntriesByCompany = (
  entries: readonly CompanyEntry[],
  clients: readonly Client[] = [],
): CompanyDocumentGroup[] => {
  const clientsByName = new Map<string, Client>();
  const clientsByEmail = new Map<string, Client>();

  clients.forEach((client) => {
    [client.companyName, client.name].forEach((name) => {
      if (name.trim() && !clientsByName.has(normalise(name))) {
        clientsByName.set(normalise(name), client);
      }
    });
    if (client.email.trim())
      clientsByEmail.set(normalise(client.email), client);
  });

  const groups = new Map<string, CompanyDocumentGroup>();

  [...entries]
    .sort((first, second) => second.createdAt - first.createdAt)
    .forEach((entry) => {
      const typedName = entry.document
        ? getDocumentCompanyName(entry.document)
        : entry.shared
          ? getSharedCompanyName(entry.shared)
          : null;
      const email = entry.document
        ? entry.document.values.toEmail?.trim()
        : entry.shared?.ownerEmail;
      const client =
        (typedName ? clientsByName.get(normalise(typedName)) : undefined) ??
        (email ? clientsByEmail.get(normalise(email)) : undefined);
      const key = client
        ? `client-${client.id}`
        : typedName
          ? `name-${slugify(typedName)}`
          : NO_CLIENT_GROUP_KEY;
      const isReceived = entry.source === "received";

      const group = groups.get(key);
      if (group) {
        group.entries.push(entry);
        group.firstAt = entry.createdAt;
        group.createdCount += isReceived ? 0 : 1;
        group.receivedCount += isReceived ? 1 : 0;
        return;
      }

      groups.set(key, {
        client,
        createdCount: isReceived ? 0 : 1,
        entries: [entry],
        firstAt: entry.createdAt,
        key,
        latestAt: entry.createdAt,
        name:
          key === NO_CLIENT_GROUP_KEY
            ? null
            : client
              ? client.companyName.trim() || client.name
              : typedName,
        receivedCount: isReceived ? 1 : 0,
      });
    });

  return [...groups.values()];
};

/**
 * Orders company groups: `newest` by latest activity (default), `oldest` by
 * earliest entry, `name` A–Z. "No client yet" is always last. Returns a new array.
 */
export const sortCompanyGroups = (
  groups: readonly CompanyDocumentGroup[],
  sort: CompanyGroupSort,
): CompanyDocumentGroup[] =>
  [...groups].sort((first, second) => {
    if (first.key === NO_CLIENT_GROUP_KEY) return 1;
    if (second.key === NO_CLIENT_GROUP_KEY) return -1;
    if (sort === "name")
      return (first.name ?? "").localeCompare(second.name ?? "");
    if (sort === "oldest") return first.firstAt - second.firstAt;
    return second.latestAt - first.latestAt;
  });

/** One month of a company's history. */
export type CompanyMonth = {
  /** `YYYY-MM`, for React keys. */
  key: string;
  /** e.g. "June 2026". */
  label: string;
  /** Newest first. */
  entries: CompanyEntry[];
};

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

/** Splits entries into calendar months, newest first, for the history timeline. */
export const groupEntriesByMonth = (
  entries: readonly CompanyEntry[],
): CompanyMonth[] => {
  const months = new Map<string, CompanyMonth>();

  [...entries]
    .sort((first, second) => second.createdAt - first.createdAt)
    .forEach((entry) => {
      const date = new Date(entry.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const month = months.get(key);

      if (month) month.entries.push(entry);
      else
        months.set(key, {
          entries: [entry],
          key,
          label: monthFormatter.format(date),
        });
    });

  return [...months.values()];
};

/** How many entries of each document type a company has, most first. */
export const countEntriesByType = (entries: readonly CompanyEntry[]) => {
  const counts = new Map<DocumentType, number>();
  entries.forEach((entry) => {
    if (entry.documentType) {
      counts.set(entry.documentType, (counts.get(entry.documentType) ?? 0) + 1);
    }
  });
  return [...counts.entries()]
    .map(([type, count]) => ({ count, type }))
    .sort((first, second) => second.count - first.count);
};

/**
 * Where a document stands, from the user's side.
 * - `not-shared`: never sent, or access was revoked.
 * - `awaiting`: sent, and the recipient hasn't opened it yet.
 * - `viewed`: the recipient opened it but hasn't signed.
 * - `signed`: signed back (or, for a received document, locked).
 * - `received`: shared with the user and not yet locked.
 */
export type EntryStatus =
  "awaiting" | "not-shared" | "received" | "signed" | "viewed";

export const entryStatusLabels: Record<EntryStatus, string> = {
  awaiting: "Awaiting signature",
  "not-shared": "Not shared",
  received: "Received",
  signed: "Signed",
  viewed: "Viewed",
};

/** Whether a value (e.g. a filter choice) is one of the {@link EntryStatus} values. */
export const isEntryStatus = (value: string): value is EntryStatus =>
  Object.hasOwn(entryStatusLabels, value);

/**
 * The status shown on a document row. Documents you sent follow the share's
 * recipient status, which the server resolves from the view and signature
 * records (`resolveRecipientStatus`), so "viewed" appears as soon as the
 * recipient opens the document even though they can't edit `recipients`.
 * Documents shared with you are "signed" once locked, else "received".
 */
export const getEntryStatus = (entry: CompanyEntry): EntryStatus => {
  if (entry.source === "received") {
    return entry.shared?.locked ? "signed" : "received";
  }
  if (entry.shareStatus === "signed") return "signed";
  if (entry.shareStatus === "viewed") return "viewed";
  if (entry.shareStatus === "pending") return "awaiting";
  return "not-shared";
};
