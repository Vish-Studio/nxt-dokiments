import { describe, expect, it } from "vitest";

import type { SharedDocument } from "@/types/sharing";

import {
  decideShareEmail,
  SHARE_EMAIL_COOLDOWN_MS,
  SHARE_EMAIL_DAILY_CAP,
  SHARE_EMAIL_WINDOW_MS,
} from "./share-email-limits";

const NOW = 1_800_000_000_000;

const share = (id: string, emailedAt: number[] = []): SharedDocument => ({
  createdAt: 0,
  id,
  locked: false,
  name: "NDA",
  ownerEmail: "owner@example.com",
  ownerId: "owner",
  ownerName: "Owner",
  recipients: [
    {
      email: "bob@example.com",
      emailedAt,
      invitedAt: 0,
      status: "pending",
    },
  ],
  signatures: {},
  sourceDocumentId: id,
  templateId: "nda",
  updatedAt: 0,
  values: {},
});

const decide = (shares: SharedDocument[], id = "doc-1") =>
  decideShareEmail({
    now: NOW,
    recipientEmail: "Bob@Example.com",
    sharedDocumentId: id,
    shares,
  });

describe("decideShareEmail", () => {
  it("sends when nothing was sent before", () => {
    expect(decide([share("doc-1")])).toBe("send");
  });

  it("holds a second email inside the cooldown", () => {
    const sent = NOW - SHARE_EMAIL_COOLDOWN_MS + 1_000;

    expect(decide([share("doc-1", [sent])])).toBe("cooldown");
  });

  it("allows another email once the cooldown has passed", () => {
    const sent = NOW - SHARE_EMAIL_COOLDOWN_MS - 1_000;

    expect(decide([share("doc-1", [sent])])).toBe("send");
  });

  it("applies the cooldown per document, not per address", () => {
    const sent = NOW - 1_000;

    expect(decide([share("doc-1"), share("doc-2", [sent])], "doc-1")).toBe(
      "send",
    );
  });

  it("stops at the daily cap across all documents", () => {
    const old = NOW - SHARE_EMAIL_COOLDOWN_MS - 1_000;
    const full = Array.from({ length: SHARE_EMAIL_DAILY_CAP }, () => old);

    expect(decide([share("doc-1"), share("doc-2", full)])).toBe("daily-cap");
  });

  it("does not count sends older than the window", () => {
    const stale = NOW - SHARE_EMAIL_WINDOW_MS - 1_000;
    const full = Array.from({ length: SHARE_EMAIL_DAILY_CAP }, () => stale);

    expect(decide([share("doc-1", full)])).toBe("send");
  });

  it("reports the cooldown before the cap when both apply", () => {
    const recent = NOW - 1_000;
    const full = Array.from({ length: SHARE_EMAIL_DAILY_CAP }, () => recent);

    expect(decide([share("doc-1", full)])).toBe("cooldown");
  });
});
