import { describe, expect, it } from "vitest";

import { recipientStatusFor } from "@/lib/sharing/recipient-status";
import type { SharedDocument } from "@/types/sharing";

const document = {
  recipients: [{ email: "sam@example.com", invitedAt: 1, status: "signed" }],
} as SharedDocument;

describe("recipientStatusFor", () => {
  it("reads the account's own status, ignoring case and spacing", () => {
    expect(recipientStatusFor(document, " Sam@Example.com ")).toBe("signed");
  });

  it("falls back to pending when the account is not listed", () => {
    expect(recipientStatusFor(document, "other@example.com")).toBe("pending");
    expect(recipientStatusFor(document, undefined)).toBe("pending");
  });
});
