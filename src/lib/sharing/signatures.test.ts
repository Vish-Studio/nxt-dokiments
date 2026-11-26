import { describe, expect, it } from "vitest";

import type { ShareSignature } from "@/types/sharing";

import {
  recipientSignatureOf,
  recipientSignatures,
  senderSignatureOf,
  withSenderSignature,
} from "./signatures";

const entry = (email: string, value: string): ShareSignature => ({
  email,
  signedAt: 1_000,
  type: "typed",
  value,
});

const owner = entry("alex@example.com", "Alex Morgan");
const recipient = entry("priya@example.com", "Priya Shah");

describe("sender and recipient signatures", () => {
  const both = {
    ownerId: "owner-1",
    signatures: { "owner-1": owner, "signer-1": recipient },
  };

  it("reads the sender signature from the owner's uid", () => {
    expect(senderSignatureOf(both)).toBe(owner);
    expect(senderSignatureOf(undefined)).toBeUndefined();
  });

  it("never counts the owner's entry as a recipient signing", () => {
    expect(recipientSignatures(both)).toEqual({ "signer-1": recipient });
    expect(recipientSignatureOf(both)).toBe(recipient);
    expect(
      recipientSignatureOf({
        ownerId: "owner-1",
        signatures: { "owner-1": owner },
      }),
    ).toBeUndefined();
  });

  it("renders the verified sender signature over the editable draft", () => {
    expect(
      withSenderSignature({ senderSignature: "draft", title: "NDA" }, owner),
    ).toEqual({ senderSignature: "Alex Morgan", title: "NDA" });

    const values = { senderSignature: "draft" };
    expect(withSenderSignature(values, undefined)).toBe(values);
  });
});
