import { describe, expect, it } from "vitest";

import { readArray, readString } from "@/lib/firebase/server-firestore";
import type { SharedDocument } from "@/types/sharing";

import {
  parseSharedDocument,
  shareLedgerEntryPath,
  toSharedDocumentFields,
} from "./server-shared-documents";

const document: Omit<SharedDocument, "id" | "templateSnapshot"> = {
  createdAt: Date.parse("2026-10-23T10:00:00.000Z"),
  locked: false,
  name: "NDA",
  ownerEmail: "alice@example.com",
  ownerId: "owner-uid",
  ownerName: "Alice",
  recipients: [
    {
      email: "bob@example.com",
      invitedAt: 1_000_000,
      status: "pending",
      uid: "bob-uid",
    },
    { email: "carol@example.com", invitedAt: 2_000_000, status: "pending" },
  ],
  signatures: {},
  sourceDocumentId: "doc_1",
  templateId: "nda",
  updatedAt: Date.parse("2026-10-23T10:00:00.000Z"),
  values: { party: "Acme" },
};

describe("shared document serialisation", () => {
  it("derives the flat recipient arrays the security rules rely on", () => {
    const fields = toSharedDocumentFields(document);

    expect(readArray(fields.recipientEmails).map(readString)).toEqual([
      "bob@example.com",
      "carol@example.com",
    ]);
    // Carol has no linked account yet, so only Bob's uid is listed.
    expect(readArray(fields.recipientUids).map(readString)).toEqual([
      "bob-uid",
    ]);
  });

  it("round-trips through Firestore's REST shape", () => {
    const parsed = parseSharedDocument(
      { fields: toSharedDocumentFields(document) },
      "s1",
    );

    expect(parsed).toEqual({ ...document, id: "s1" });
  });

  it("reports a recipient as signed once a signature exists, matched by uid", () => {
    const signed = {
      ...document,
      locked: true,
      signatures: {
        "bob-uid": {
          email: "bob@example.com",
          signedAt: 5_000_000,
          type: "typed" as const,
          value: "Bob",
        },
      },
    };

    const parsed = parseSharedDocument(
      { fields: toSharedDocumentFields(signed) },
      "s1",
    );

    expect(parsed.recipients[0]).toMatchObject({
      signedAt: 5_000_000,
      status: "signed",
    });
    expect(parsed.recipients[1].status).toBe("pending");
  });

  it("matches a signature to a recipient with no linked uid by email", () => {
    const signed = {
      ...document,
      signatures: {
        "carol-uid": {
          email: "carol@example.com",
          signedAt: 6_000_000,
          type: "typed" as const,
          value: "Carol",
        },
      },
    };

    const parsed = parseSharedDocument(
      { fields: toSharedDocumentFields(signed) },
      "s1",
    );

    expect(parsed.recipients[1].status).toBe("signed");
  });

  it("keys ledger entries by the normalised address", () => {
    expect(shareLedgerEntryPath("u1", " Bob@Example.com ")).toBe(
      "users/u1/shareRecipients/bob@example.com",
    );
  });
});
