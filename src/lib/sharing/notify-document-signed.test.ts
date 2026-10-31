import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/types/auth";
import type { SharedDocument } from "@/types/sharing";

const mocks = vi.hoisted(() => ({ sendEmail: vi.fn() }));

vi.mock("@/lib/email/send-email", () => ({ sendEmail: mocks.sendEmail }));

import { notifyDocumentSigned } from "./notify-document-signed";

const SIGNED_AT = Date.UTC(2026, 9, 31, 21, 30);

const session = {
  idToken: "token",
  user: {
    displayName: "Bob Smith",
    email: "bob@example.com",
    uid: "bob-uid",
  },
} as unknown as AuthSession;

const signedDocument = (
  overrides: Partial<SharedDocument> = {},
): SharedDocument => ({
  createdAt: 0,
  id: "owner-uid_doc_1",
  locked: true,
  name: "Service agreement",
  ownerEmail: "jane@example.com",
  ownerId: "owner-uid",
  ownerName: "Jane Doe",
  recipients: [{ email: "bob@example.com", invitedAt: 0, status: "signed" }],
  signatures: {
    "bob-uid": {
      email: "bob@example.com",
      signedAt: SIGNED_AT,
      type: "typed",
      value: "Bob Smith",
    },
  },
  sourceDocumentId: "doc_1",
  templateId: "nda",
  updatedAt: 0,
  values: {},
  ...overrides,
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mocks.sendEmail.mockResolvedValue({ id: "email-1", ok: true });
});

describe("notifyDocumentSigned", () => {
  it("emails the owner that the recipient signed", async () => {
    const result = await notifyDocumentSigned(session, signedDocument());

    expect(result).toEqual({ sent: true });
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Bob Smith signed "Service agreement"',
        to: "jane@example.com",
      }),
    );
  });

  it("links to the shared copy and never includes the signature value", async () => {
    await notifyDocumentSigned(
      session,
      signedDocument({
        signatures: {
          "bob-uid": {
            email: "bob@example.com",
            signedAt: SIGNED_AT,
            type: "typed",
            value: "Secret Flourish",
          },
        },
      }),
    );

    const { react } = mocks.sendEmail.mock.calls[0][0];
    expect(react.props.url).toMatch(/\/my-documents\/shared\/owner-uid_doc_1$/);
    expect(react.props.signedAtLabel).toBe("31 Oct 2026, 21:30 UTC");
    expect(JSON.stringify(react.props)).not.toContain("Secret Flourish");
  });

  it("falls back to the signer's email when they have no display name", async () => {
    const unnamed = {
      ...session,
      user: { ...session.user, displayName: "" },
    } as AuthSession;

    await notifyDocumentSigned(unnamed, signedDocument());

    expect(mocks.sendEmail.mock.calls[0][0].subject).toBe(
      'bob@example.com signed "Service agreement"',
    );
  });

  it("uses a stable idempotency key per signature, kept short", async () => {
    await notifyDocumentSigned(session, signedDocument());
    await notifyDocumentSigned(session, signedDocument());

    const [first, second] = mocks.sendEmail.mock.calls.map(
      ([arg]) => arg.idempotencyKey as string,
    );
    expect(first).toBe(second);
    expect(first).toMatch(/^signed-[0-9a-f]{64}$/);
  });

  it("sends nothing when the document carries no signature from the caller", async () => {
    const result = await notifyDocumentSigned(
      session,
      signedDocument({ signatures: {} }),
    );

    expect(result).toEqual({ reason: "no-signature", sent: false });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it.each(["blocked", "disabled", "provider-error"] as const)(
    "reports a %s send without throwing",
    async (reason) => {
      mocks.sendEmail.mockResolvedValue({ ok: false, reason });

      expect(await notifyDocumentSigned(session, signedDocument())).toEqual({
        reason,
        sent: false,
      });
    },
  );

  it("never throws, even if sending blows up", async () => {
    mocks.sendEmail.mockRejectedValue(new Error("boom"));

    expect(await notifyDocumentSigned(session, signedDocument())).toEqual({
      reason: "error",
      sent: false,
    });
  });
});
