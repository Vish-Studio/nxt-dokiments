import { describe, expect, it } from "vitest";

import type { Client } from "@/types/client";
import type { SharedDocument } from "@/types/sharing";
import type { UserDocument } from "@/types/template";

import {
  buildCompanyEntries,
  countEntriesByType,
  getEntryStatus,
  getDocumentCompanyName,
  getSharedCompanyName,
  groupEntriesByCompany,
  groupEntriesByMonth,
  NO_CLIENT_GROUP_KEY,
  sortCompanyGroups,
} from "./company-groups";

const doc = (
  id: string,
  createdAt: string,
  values: Record<string, string> = {},
): UserDocument => ({
  createdAt: new Date(createdAt).getTime(),
  id,
  name: id,
  templateId: "classic-invoice",
  updatedAt: new Date(createdAt).getTime(),
  values,
});

const shared = (
  id: string,
  createdAt: string,
  overrides: Partial<SharedDocument> = {},
): SharedDocument => ({
  createdAt: new Date(createdAt).getTime(),
  id,
  locked: false,
  name: id,
  ownerEmail: "alex@northline.com",
  ownerId: "owner-1",
  ownerName: "Alex Morgan",
  recipients: [],
  signatures: {},
  sourceDocumentId: `src-${id}`,
  templateId: "classic-nda",
  updatedAt: new Date(createdAt).getTime(),
  values: {},
  ...overrides,
});

const northline: Client = {
  address: "",
  brn: "",
  companyName: "Northline Studio",
  createdAt: 0,
  email: "accounts@northline.com",
  id: "client_northline",
  name: "Maya Chen",
  nationalId: "",
  phone: "",
  updatedAt: 0,
};

describe("company names", () => {
  it("reads the client block, then the NDA receiving party", () => {
    expect(getDocumentCompanyName(doc("a", "2026-01-01", { toName: " Acme " }))).toBe("Acme");
    expect(getDocumentCompanyName(doc("b", "2026-01-01", { partyTwo: "Globex" }))).toBe("Globex");
    expect(getDocumentCompanyName(doc("c", "2026-01-01"))).toBeNull();
  });

  it("names a shared document by its sender block, then the owner", () => {
    expect(getSharedCompanyName(shared("s", "2026-01-01", { values: { fromName: "Northline Studio" } }))).toBe("Northline Studio");
    expect(getSharedCompanyName(shared("t", "2026-01-01"))).toBe("Alex Morgan");
  });
});

describe("buildCompanyEntries + groupEntriesByCompany", () => {
  const entries = buildCompanyEntries(
    [
      doc("old", "2026-03-01", { title: "March invoice", toName: "northline  studio" }),
      doc("new", "2026-06-18", { toName: "Maya Chen" }),
      doc("loose", "2026-06-03"),
    ],
    [shared("in", "2026-05-01", { values: { fromName: "Northline Studio" } })],
    [shared("out", "2026-06-19", { recipients: [{ email: "maya@northline.com", invitedAt: 0, status: "viewed" }], sourceDocumentId: "new" })],
  );

  it("marks direction, titles and share status", () => {
    const created = entries.find((entry) => entry.id === "doc:new");
    expect(created?.source).toBe("created");
    expect(created?.shareStatus).toBe("viewed");
    expect(entries.find((entry) => entry.id === "doc:old")?.title).toBe("March invoice");
    const received = entries.find((entry) => entry.id === "shared:in");
    expect(received?.source).toBe("received");
    expect(received?.sharedBy).toBe("Alex Morgan");
  });

  it("joins both directions under one client, newest first, with counts", () => {
    const groups = groupEntriesByCompany(entries, [northline]);
    const company = groups.find((group) => group.key === "client-client_northline");

    expect(company?.name).toBe("Northline Studio");
    expect(company?.entries.map((entry) => entry.id)).toEqual(["doc:new", "shared:in", "doc:old"]);
    expect(company?.createdCount).toBe(2);
    expect(company?.receivedCount).toBe(1);
    expect(company?.firstAt).toBe(new Date("2026-03-01").getTime());
    expect(groups.find((group) => group.key === NO_CLIENT_GROUP_KEY)?.name).toBeNull();
  });

  it("groups companies outside the client book by a URL-safe name key", () => {
    const groups = groupEntriesByCompany(buildCompanyEntries([doc("a", "2026-06-01", { toName: "Lumina Events & Co" })]));
    expect(groups[0].key).toBe("name-lumina-events-co");
  });
});

describe("sorting, months and types", () => {
  const groups = groupEntriesByCompany(
    buildCompanyEntries([
      doc("x", "2026-06-10", { toName: "Zeta" }),
      doc("y", "2026-01-10", { toName: "Alpha" }),
      doc("z", "2026-07-01"),
    ]),
  );

  it("keeps 'No client yet' last whatever the sort", () => {
    expect(sortCompanyGroups(groups, "newest").map((group) => group.name)).toEqual(["Zeta", "Alpha", null]);
    expect(sortCompanyGroups(groups, "oldest").map((group) => group.name)).toEqual(["Alpha", "Zeta", null]);
    expect(sortCompanyGroups(groups, "name").map((group) => group.name)).toEqual(["Alpha", "Zeta", null]);
  });

  it("splits into months and counts types", () => {
    const entries = buildCompanyEntries([
      doc("a", "2026-05-03T10:00:00"),
      doc("b", "2026-06-18T09:30:00"),
    ]).map((entry) => ({ ...entry, documentType: "invoice" as const }));

    expect(groupEntriesByMonth(entries).map((month) => month.label)).toEqual(["June 2026", "May 2026"]);
    expect(countEntriesByType(entries)).toEqual([{ count: 2, type: "invoice" }]);
  });
});

describe("getEntryStatus", () => {
  it("reads signed, awaiting, not shared and received", () => {
    const [a, b, c, d, e] = buildCompanyEntries([
      doc("a", "2026-06-01"),
      doc("b", "2026-06-02"),
      doc("c", "2026-06-03"),
      doc("d", "2026-06-04"),
      doc("e", "2026-06-05"),
    ]);
    const [locked, open] = buildCompanyEntries(
      [],
      [
        shared("s1", "2026-06-05", { locked: true }),
        shared("s2", "2026-06-06"),
      ],
    );

    expect(
      [
        { ...a, shareStatus: "signed" as const },
        { ...b, shareStatus: "pending" as const },
        { ...c, shareStatus: "viewed" as const },
        { ...d, shareStatus: "revoked" as const },
        e,
        open,
        locked,
      ].map(getEntryStatus),
    ).toEqual([
      "signed",
      "awaiting",
      "awaiting",
      "not-shared",
      "not-shared",
      "received",
      "signed",
    ]);
  });
});
