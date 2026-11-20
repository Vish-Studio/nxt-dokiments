import {
  buildCompanyEntries,
  groupEntriesByCompany,
  sortCompanyGroups,
} from "@/lib/documents/company-groups";
import { getTemplateById } from "@/lib/market-place";
import type { Client } from "@/types/client";
import type { SharedDocument } from "@/types/sharing";
import type { TemplateSnapshot, UserDocument } from "@/types/template";

/**
 * Shared story fixtures for the My Documents "Companies" tab and company page:
 * realistic documents for three companies (Northline is in the client book and
 * also shared an NDA with the user), plus one document with no client.
 * Story-only: never import from application code.
 */
export const northlineClient: Client = {
  address: "24 Market Street, Ebene",
  brn: "C09876543",
  companyName: "Northline Studio",
  createdAt: 1_755_000_000_000,
  email: "accounts@northline.com",
  id: "client_northline_01",
  name: "Maya Chen",
  nationalId: "",
  phone: "+230 5 987 6543",
  updatedAt: 1_755_000_000_000,
};

const snapshotOf = (templateId: string): TemplateSnapshot => {
  const template = getTemplateById(templateId);
  if (!template) throw new Error(`Unknown fixture template: ${templateId}`);
  return {
    description: template.description,
    documentType: template.documentType,
    fields: template.fields,
    name: template.name,
    style: template.style,
  };
};

const storyDocument = (
  id: string,
  templateId: string,
  createdAt: string,
  values: Record<string, string>,
): UserDocument => ({
  createdAt: new Date(createdAt).getTime(),
  id,
  name: values.title ?? id,
  templateId,
  templateSnapshot: snapshotOf(templateId),
  updatedAt: new Date(createdAt).getTime(),
  values,
});

const storyShared = (
  id: string,
  templateId: string,
  createdAt: string,
  overrides: Partial<SharedDocument>,
): SharedDocument => ({
  createdAt: new Date(createdAt).getTime(),
  id,
  locked: false,
  name: id,
  ownerEmail: "alex@northline.com",
  ownerId: "owner-northline",
  ownerName: "Alex Morgan",
  recipients: [
    {
      email: "anthony@dokiments.com",
      invitedAt: new Date(createdAt).getTime(),
      status: "viewed",
    },
  ],
  signatures: {},
  sourceDocumentId: `source-${id}`,
  templateId,
  templateSnapshot: snapshotOf(templateId),
  updatedAt: new Date(createdAt).getTime(),
  values: {},
  ...overrides,
});

export const companyStoryDocuments: UserDocument[] = [
  storyDocument("nl-1", "classic-invoice", "2026-06-18T09:30:00", { title: "June retainer invoice", toName: "Northline Studio", total: "1250" }),
  storyDocument("nl-2", "classic-quotation", "2026-06-02T14:10:00", { title: "Brand refresh quotation", toName: "Northline Studio" }),
  storyDocument("nl-3", "classic-contract", "2026-05-12T11:00:00", { title: "Design services contract", toName: "Maya Chen" }),
  storyDocument("nl-4", "classic-invoice", "2026-04-28T08:45:00", { title: "April retainer invoice", toName: "Northline Studio" }),
  storyDocument("lu-1", "classic-invoice", "2026-06-10T10:00:00", { title: "Lumina Events invoice", toName: "Lumina Events", total: "Rs 10,000" }),
  storyDocument("lu-2", "classic-nda", "2026-03-03T16:20:00", { partyTwo: "Lumina Events", title: "Event planning NDA" }),
  storyDocument("no-1", "classic-proposal", "2026-06-15T09:00:00", { title: "Website proposal draft" }),
];

/** Northline shared an NDA with the user. */
export const companyStorySharedWithMe: SharedDocument[] = [
  storyShared("sh-in-1", "classic-nda", "2026-05-20T15:00:00", {
    name: "Mutual NDA",
    values: { fromName: "Northline Studio", title: "Mutual NDA" },
  }),
];

/** The user shared their June invoice with Northline, who has signed it. */
export const companyStorySharedByMe: SharedDocument[] = [
  storyShared("sh-out-1", "classic-invoice", "2026-06-18T10:00:00", {
    ownerEmail: "anthony@dokiments.com",
    ownerId: "story-uid",
    ownerName: "Anthony Alverizko",
    recipients: [
      {
        email: "accounts@northline.com",
        invitedAt: new Date("2026-06-18T10:00:00").getTime(),
        signedAt: new Date("2026-06-19T09:00:00").getTime(),
        status: "signed",
      },
    ],
    sourceDocumentId: "nl-1",
  }),
];

/** The fixtures grouped and sorted exactly as `DocumentsView` does. */
export const companyStoryGroups = sortCompanyGroups(
  groupEntriesByCompany(
    buildCompanyEntries(
      companyStoryDocuments,
      companyStorySharedWithMe,
      companyStorySharedByMe,
    ),
    [northlineClient],
  ),
  "newest",
);

/** Northline Studio: 4 created + 1 received, matched to a client. */
export const northlineGroup = companyStoryGroups[0];

/** The "No client yet" group. */
export const noClientGroup = companyStoryGroups[companyStoryGroups.length - 1];
