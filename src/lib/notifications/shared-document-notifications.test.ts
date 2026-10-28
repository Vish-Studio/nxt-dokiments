import { describe, expect, it } from "vitest";

import type { SharedDocument } from "@/types/sharing";

import { sharedDocumentNotifications } from "./shared-document-notifications";

const makeDocument = (overrides: Partial<SharedDocument> = {}) =>
  ({
    createdAt: 1_000,
    id: "share-1",
    locked: false,
    name: "Website redesign NDA",
    ownerEmail: "alex@example.com",
    ownerId: "owner-1",
    ownerName: "Alex Morgan",
    recipients: [
      { email: "priya@example.com", invitedAt: 5_000, status: "pending" },
    ],
    signatures: {},
    sourceDocumentId: "doc-1",
    templateId: "nda",
    updatedAt: 9_000,
    values: {},
    ...overrides,
  }) satisfies SharedDocument;

describe("sharedDocumentNotifications", () => {
  it("maps a share to a notification stamped with the recipient's invitedAt", () => {
    expect(
      sharedDocumentNotifications([makeDocument()], "priya@example.com"),
    ).toEqual([
      {
        action: {
          href: "/my-documents?tab=shared",
          label: "View shared documents",
        },
        body: "Website redesign NDA",
        createdAt: 5_000,
        id: "document-shared:share-1",
        kind: "document-shared",
        title: "Alex Morgan shared a document",
      },
    ]);
  });

  it("matches the account email case-insensitively", () => {
    expect(
      sharedDocumentNotifications([makeDocument()], "  Priya@Example.com "),
    ).toHaveLength(1);
  });

  it("prefers the document title over the stored name", () => {
    const [notification] = sharedDocumentNotifications(
      [makeDocument({ values: { title: " Q3 NDA " } })],
      "priya@example.com",
    );

    expect(notification.body).toBe("Q3 NDA");
  });

  it("falls back to the owner's address when they have no name", () => {
    const [notification] = sharedDocumentNotifications(
      [makeDocument({ ownerName: " " })],
      "priya@example.com",
    );

    expect(notification.title).toBe("alex@example.com shared a document");
  });

  it("skips revoked shares", () => {
    const document = makeDocument({
      recipients: [
        { email: "priya@example.com", invitedAt: 5_000, status: "revoked" },
      ],
    });

    expect(
      sharedDocumentNotifications([document], "priya@example.com"),
    ).toEqual([]);
  });

  it("skips shares that do not list the account", () => {
    expect(
      sharedDocumentNotifications([makeDocument()], "someone@example.com"),
    ).toEqual([]);
  });
});
