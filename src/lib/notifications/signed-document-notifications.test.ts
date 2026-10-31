import { describe, expect, it } from "vitest";

import type { SharedDocument } from "@/types/sharing";

import { signedDocumentNotifications } from "./signed-document-notifications";

const makeDocument = (overrides: Partial<SharedDocument> = {}) =>
  ({
    createdAt: 1_000,
    id: "share-1",
    locked: true,
    name: "Website redesign NDA",
    ownerEmail: "alex@example.com",
    ownerId: "owner-1",
    ownerName: "Alex Morgan",
    recipients: [
      {
        email: "priya@example.com",
        invitedAt: 5_000,
        signedAt: 8_000,
        status: "signed",
        uid: "signer-1",
      },
    ],
    signatures: {
      "signer-1": {
        email: "priya@example.com",
        signedAt: 8_000,
        type: "typed",
        value: "Priya Shah",
      },
    },
    sourceDocumentId: "doc-1",
    templateId: "nda",
    updatedAt: 9_000,
    values: {},
    ...overrides,
  }) satisfies SharedDocument;

describe("signedDocumentNotifications", () => {
  it("maps a signature to a notification stamped with its signedAt", () => {
    expect(signedDocumentNotifications([makeDocument()], "owner-1")).toEqual([
      {
        action: {
          href: "/my-documents/shared/share-1",
          label: "View shared copy",
        },
        body: "Website redesign NDA",
        createdAt: 8_000,
        id: "document-signed:share-1:signer-1",
        kind: "document-signed",
        title: "priya@example.com signed a document",
      },
    ]);
  });

  it("prefers the document title over the stored name", () => {
    const [notification] = signedDocumentNotifications(
      [makeDocument({ values: { title: " Q3 NDA " } })],
      "owner-1",
    );

    expect(notification.body).toBe("Q3 NDA");
  });

  it("skips documents that are not signed yet", () => {
    expect(
      signedDocumentNotifications(
        [makeDocument({ locked: false, signatures: {} })],
        "owner-1",
      ),
    ).toEqual([]);
  });

  it("does not notify anyone but the owner", () => {
    expect(signedDocumentNotifications([makeDocument()], "signer-1")).toEqual(
      [],
    );
  });

  it("emits one notification per signature across documents", () => {
    const second = makeDocument({
      id: "share-2",
      signatures: {
        "signer-2": {
          email: "sam@example.com",
          signedAt: 12_000,
          type: "typed",
          value: "Sam",
        },
      },
    });

    expect(
      signedDocumentNotifications([makeDocument(), second], "owner-1").map(
        (notification) => notification.id,
      ),
    ).toEqual([
      "document-signed:share-1:signer-1",
      "document-signed:share-2:signer-2",
    ]);
  });
});
