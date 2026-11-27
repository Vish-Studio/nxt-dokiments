import { describe, expect, it } from "vitest";

import type { SharedDocument, ShareRecipient } from "@/types/sharing";
import type { UserDocument } from "@/types/template";

import {
  getCompanyGroupSummary,
  getEntryActivity,
  getEntryContact,
  getEntryNumber,
} from "./company-entry-details";
import { buildCompanyEntries, groupEntriesByCompany } from "./company-groups";

const at = (value: string) => new Date(value).getTime();

const doc = (
  id: string,
  values: Record<string, string> = {},
): UserDocument => ({
  createdAt: at("2026-11-18T09:00:00Z"),
  id,
  name: id,
  templateId: "classic-invoice",
  updatedAt: at("2026-11-23T09:00:00Z"),
  values: { toName: "GlobalEx Ltd", ...values },
});

const share = (
  sourceDocumentId: string,
  recipient: Partial<ShareRecipient>,
  overrides: Partial<SharedDocument> = {},
): SharedDocument => ({
  createdAt: at("2026-11-20T09:00:00Z"),
  id: `share-${sourceDocumentId}`,
  locked: false,
  name: sourceDocumentId,
  ownerEmail: "me@studio.mu",
  ownerId: "me",
  ownerName: "Me",
  recipients: [
    {
      email: "ravi@globalex.mu",
      invitedAt: at("2026-11-20T09:00:00Z"),
      status: "pending",
      ...recipient,
    },
  ],
  signatures: {},
  sourceDocumentId,
  templateId: "classic-invoice",
  updatedAt: at("2026-11-24T09:00:00Z"),
  values: {},
  ...overrides,
});

const entryFor = (document: UserDocument, sharedByMe: SharedDocument[] = []) =>
  buildCompanyEntries([document], [], sharedByMe)[0];

describe("getEntryNumber", () => {
  it("reads the template's number field, skipping blanks", () => {
    expect(
      getEntryNumber(entryFor(doc("a", { invoiceNumber: " INV-0042 " }))),
    ).toBe("INV-0042");
    expect(
      getEntryNumber(
        entryFor(doc("b", { invoiceNumber: "", quoteNumber: "Q-7" })),
      ),
    ).toBe("Q-7");
    expect(getEntryNumber(entryFor(doc("c", { crNumber: "CR-3" })))).toBe(
      "CR-3",
    );
    expect(getEntryNumber(entryFor(doc("d")))).toBe("");
  });
});

describe("getEntryActivity and getEntryContact", () => {
  it("says a document nobody has seen yet is not sent, with no contact", () => {
    const entry = entryFor(doc("a"));
    expect(getEntryActivity(entry)).toBe("Not sent yet");
    expect(getEntryContact(entry)).toBe("");
  });

  it("puts who in the contact and what and when in the activity", () => {
    const sent = entryFor(doc("a"), [share("a", {})]);
    expect(getEntryContact(sent)).toBe("ravi@globalex.mu");
    expect(getEntryActivity(sent)).toBe("Sent 20/11/26");

    expect(
      getEntryActivity(entryFor(doc("a"), [share("a", { status: "viewed" })])),
    ).toBe("Opened, not signed yet");
    expect(
      getEntryActivity(
        entryFor(doc("a"), [
          share("a", {
            signedAt: at("2026-11-19T09:00:00Z"),
            status: "signed",
          }),
        ]),
      ),
    ).toBe("Signed 19/11/26");
  });

  it("drops the contact once access is revoked", () => {
    const revoked = entryFor(doc("a"), [share("a", { status: "revoked" })]);
    expect(getEntryContact(revoked)).toBe("");
    expect(getEntryActivity(revoked)).toBe("Not sent yet");
  });

  it("names the sender of a received document", () => {
    const received = buildCompanyEntries(
      [],
      [share("x", {}, { ownerName: "Ravi Patel" })],
    )[0];
    expect(getEntryContact(received)).toBe("From Ravi Patel");
    expect(getEntryActivity(received)).toBe("Shared with you");
  });
});

describe("getCompanyGroupSummary", () => {
  it("counts documents and only the statuses worth acting on", () => {
    const entries = buildCompanyEntries(
      [doc("a"), doc("b"), doc("c")],
      [],
      [share("a", {})],
    );
    const [group] = groupEntriesByCompany(entries, []);
    expect(getCompanyGroupSummary(group)).toBe(
      "3 documents · 1 awaiting signature",
    );
  });

  it("counts viewed documents as still awaiting signature", () => {
    const entries = buildCompanyEntries(
      [doc("a"), doc("b")],
      [],
      [share("a", {}), share("b", { status: "viewed" })],
    );
    const [group] = groupEntriesByCompany(entries, []);
    expect(getCompanyGroupSummary(group)).toBe(
      "2 documents · 2 awaiting signature",
    );
  });

  it("uses the singular for one document", () => {
    const [group] = groupEntriesByCompany(buildCompanyEntries([doc("a")]), []);
    expect(getCompanyGroupSummary(group)).toBe("1 document");
  });
});

describe("buildCompanyEntries updatedAt", () => {
  it("uses the later of the document and its share", () => {
    expect(entryFor(doc("a"), [share("a", {})]).updatedAt).toBe(
      at("2026-11-24T09:00:00Z"),
    );
    expect(entryFor(doc("a")).updatedAt).toBe(at("2026-11-23T09:00:00Z"));
  });
});
