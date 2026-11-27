import { describe, expect, it } from "vitest";

import type { SharedDocument } from "@/types/sharing";
import type { UserDocument } from "@/types/template";

import { getDocumentDetails } from "./document-details";

const created = new Date("2026-06-08T09:30:00").getTime();

const document = (overrides: Partial<UserDocument> = {}): UserDocument => ({
  createdAt: created,
  id: "doc-1",
  name: "Invoice",
  templateId: "classic-invoice",
  updatedAt: created,
  values: { toName: "Northline Studio", total: "1250" },
  ...overrides,
});

describe("getDocumentDetails", () => {
  it("lists client, amount, status and created date", () => {
    expect(getDocumentDetails(document())).toEqual([
      { label: "Client", value: "Northline Studio" },
      { label: "Amount", value: "1,250.00" },
      { label: "Status", value: "Not shared" },
      { label: "Created", value: "08/06/26, 09:30" },
    ]);
  });

  it("leaves out an empty amount, adds last edited and reads the share", () => {
    const share = {
      locked: false,
      recipients: [
        { email: "maya@northline.com", invitedAt: 0, status: "pending" },
      ],
      sourceDocumentId: "doc-1",
    } as unknown as SharedDocument;

    expect(
      getDocumentDetails(
        document({
          updatedAt: new Date("2026-06-09T10:00:00").getTime(),
          values: {},
        }),
        [share],
      ),
    ).toEqual([
      { label: "Client", value: "No client yet" },
      { label: "Status", value: "Awaiting signature" },
      { label: "Created", value: "08/06/26, 09:30" },
      { label: "Last edited", value: "09/06/26, 10:00" },
    ]);
  });
});
