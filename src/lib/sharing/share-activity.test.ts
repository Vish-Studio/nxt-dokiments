import { describe, expect, it } from "vitest";

import {
  activeRecipient,
  currentRecipient,
  resolveRecipientStatus,
  shareTimeline,
} from "@/lib/sharing/share-activity";
import type { ShareRecipient, SharedDocument } from "@/types/sharing";

const recipient = (
  overrides: Partial<ShareRecipient> = {},
): ShareRecipient => ({
  email: "sam@example.com",
  invitedAt: 100,
  status: "pending",
  ...overrides,
});

const signature = {
  email: "sam@example.com",
  signedAt: 300,
  type: "typed" as const,
  value: "Sam",
};

describe("activeRecipient and currentRecipient", () => {
  it("skips revoked recipients", () => {
    const document = {
      recipients: [
        recipient({ email: "old@example.com", status: "revoked" }),
        recipient(),
      ],
    };

    expect(activeRecipient(document)?.email).toBe("sam@example.com");
    expect(currentRecipient(document)?.email).toBe("sam@example.com");
  });

  it("has no active recipient once everyone is revoked, but still names one", () => {
    const document = {
      recipients: [
        recipient({ email: "a@example.com", status: "revoked" }),
        recipient({ email: "b@example.com", status: "revoked" }),
      ],
    };

    expect(activeRecipient(document)).toBeUndefined();
    expect(currentRecipient(document)?.email).toBe("b@example.com");
  });

  it("returns undefined for a document with no recipients", () => {
    expect(currentRecipient({ recipients: [] })).toBeUndefined();
  });
});

describe("resolveRecipientStatus", () => {
  it("is pending with no signature and no view", () => {
    expect(
      resolveRecipientStatus(recipient(), { signatures: {}, views: {} }),
    ).toEqual({ signedAt: undefined, status: "pending" });
  });

  it("is viewed once the recipient has opened it, matched by address", () => {
    expect(
      resolveRecipientStatus(recipient(), {
        signatures: {},
        views: { u1: { email: "sam@example.com", viewedAt: 200 } },
      }).status,
    ).toBe("viewed");
  });

  it("matches a view by uid when the recipient is linked", () => {
    expect(
      resolveRecipientStatus(recipient({ uid: "u1" }), {
        signatures: {},
        views: { u1: { email: "other@example.com", viewedAt: 200 } },
      }).status,
    ).toBe("viewed");
  });

  it("is signed, with the signature time, whatever else is stored", () => {
    expect(
      resolveRecipientStatus(recipient(), {
        signatures: { u1: signature },
        views: { u1: { email: "sam@example.com", viewedAt: 200 } },
      }),
    ).toEqual({ signedAt: 300, status: "signed" });
  });

  it("ignores views and signatures of other people", () => {
    expect(
      resolveRecipientStatus(recipient(), {
        signatures: { u2: { ...signature, email: "kim@example.com" } },
        views: { u2: { email: "kim@example.com", viewedAt: 200 } },
      }).status,
    ).toBe("pending");
  });

  it("keeps a revoked recipient revoked", () => {
    expect(
      resolveRecipientStatus(recipient({ status: "revoked" }), {
        signatures: {},
        views: { u1: { email: "sam@example.com", viewedAt: 200 } },
      }).status,
    ).toBe("revoked");
  });
});

describe("shareTimeline", () => {
  const document = (overrides: Partial<SharedDocument>): SharedDocument =>
    ({
      recipients: [recipient()],
      signatures: {},
      views: {},
      ...overrides,
    }) as SharedDocument;

  it("lists shared, viewed and signed in time order", () => {
    expect(
      shareTimeline(
        document({
          signatures: { u1: signature },
          views: { u1: { email: "sam@example.com", viewedAt: 200 } },
        }),
      ),
    ).toEqual([
      { at: 100, email: "sam@example.com", kind: "shared" },
      { at: 200, email: "sam@example.com", kind: "viewed" },
      { at: 300, email: "sam@example.com", kind: "signed" },
    ]);
  });

  it("lists a revoke", () => {
    expect(
      shareTimeline(
        document({
          recipients: [recipient({ revokedAt: 250, status: "revoked" })],
        }),
      ).map((event) => event.kind),
    ).toEqual(["shared", "revoked"]);
  });

  it("uses only the first view of a recipient", () => {
    const events = shareTimeline(
      document({
        views: {
          u1: { email: "sam@example.com", viewedAt: 400 },
          u2: { email: "sam@example.com", viewedAt: 150 },
        },
      }),
    );

    expect(events.filter((event) => event.kind === "viewed")).toEqual([
      { at: 150, email: "sam@example.com", kind: "viewed" },
    ]);
  });

  it("copes with a document that has no views", () => {
    expect(
      shareTimeline(document({ views: undefined })).map((event) => event.kind),
    ).toEqual(["shared"]);
  });
});
