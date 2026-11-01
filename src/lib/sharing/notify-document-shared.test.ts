import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/types/auth";
import type { SharedDocument } from "@/types/sharing";

const mocks = vi.hoisted(() => ({
  listSharedByMe: vi.fn(),
  recordShareEmail: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/firebase/server-shared-documents", () => ({
  listSharedByMe: mocks.listSharedByMe,
  recordShareEmail: mocks.recordShareEmail,
}));
vi.mock("@/lib/email/send-email", () => ({ sendEmail: mocks.sendEmail }));

import { notifyDocumentShared } from "./notify-document-shared";
import {
  SHARE_EMAIL_DAILY_CAP,
  SHARE_EMAIL_WINDOW_MS,
} from "./share-email-limits";

const session = {
  idToken: "token",
  user: {
    displayName: "Jane Doe",
    email: "jane@example.com",
    uid: "owner-uid",
  },
} as unknown as AuthSession;

const input = {
  created: true,
  documentName: "Service agreement",
  recipientEmail: "bob@example.com",
  sharedAt: 1_800_000_000_000,
  sharedDocumentId: "owner-uid_doc_1",
};

const share = (emailedAt: number[] = []): SharedDocument => ({
  createdAt: 0,
  id: "owner-uid_doc_1",
  locked: false,
  name: "Service agreement",
  ownerEmail: "jane@example.com",
  ownerId: "owner-uid",
  ownerName: "Jane Doe",
  recipients: [
    { email: "bob@example.com", emailedAt, invitedAt: 0, status: "pending" },
  ],
  signatures: {},
  sourceDocumentId: "doc_1",
  templateId: "nda",
  updatedAt: 0,
  values: {},
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mocks.listSharedByMe.mockResolvedValue([share()]);
  mocks.recordShareEmail.mockResolvedValue(true);
  mocks.sendEmail.mockResolvedValue({ id: "email-1", ok: true });
});

describe("notifyDocumentShared", () => {
  it("sends the email, then records it", async () => {
    const result = await notifyDocumentShared(session, input);

    expect(result).toEqual({ sent: true });
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Jane Doe shared "Service agreement" with you',
        to: "bob@example.com",
      }),
    );
    expect(mocks.recordShareEmail).toHaveBeenCalledWith(
      session,
      "owner-uid_doc_1",
      "bob@example.com",
      expect.any(Number),
      SHARE_EMAIL_WINDOW_MS,
    );
  });

  it("uses the 'updated' wording for a re-share", async () => {
    await notifyDocumentShared(session, { ...input, created: false });

    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Jane Doe updated "Service agreement"',
      }),
    );
  });

  it("builds a stable, short idempotency key per share", async () => {
    await notifyDocumentShared(session, input);
    await notifyDocumentShared(session, input);
    await notifyDocumentShared(session, {
      ...input,
      sharedAt: input.sharedAt + 1,
    });

    const keys = mocks.sendEmail.mock.calls.map(
      ([call]) => call.idempotencyKey as string,
    );
    expect(keys[0]).toBe(keys[1]);
    expect(keys[2]).not.toBe(keys[0]);
    expect(keys[0].length).toBeLessThanOrEqual(256);
  });

  it("holds the email back inside the cooldown", async () => {
    mocks.listSharedByMe.mockResolvedValue([share([Date.now() - 1_000])]);

    expect(await notifyDocumentShared(session, input)).toEqual({
      reason: "cooldown",
      sent: false,
    });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("holds the email back at the daily cap", async () => {
    const old = Date.now() - 60 * 60 * 1000;
    mocks.listSharedByMe.mockResolvedValue([
      share(Array.from({ length: SHARE_EMAIL_DAILY_CAP }, () => old)),
    ]);

    expect(await notifyDocumentShared(session, input)).toEqual({
      reason: "daily-cap",
      sent: false,
    });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it.each(["disabled", "blocked", "provider-error"] as const)(
    "does not record a send when the email is %s",
    async (reason) => {
      mocks.sendEmail.mockResolvedValue({ ok: false, reason });

      expect(await notifyDocumentShared(session, input)).toEqual({
        reason,
        sent: false,
      });
      expect(mocks.recordShareEmail).not.toHaveBeenCalled();
    },
  );

  it("cleans line breaks out of the subject", async () => {
    await notifyDocumentShared(session, {
      ...input,
      documentName: "NDA\nBcc: x@evil.com",
    });

    const { subject } = mocks.sendEmail.mock.calls[0][0];
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it("never throws when reading the shares fails", async () => {
    mocks.listSharedByMe.mockRejectedValue(new Error("firestore down"));

    expect(await notifyDocumentShared(session, input)).toEqual({
      reason: "error",
      sent: false,
    });
  });
});
