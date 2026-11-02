import { sealData } from "iron-session";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const flag = vi.hoisted(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.SESSION_SECRET = "a-test-secret-that-is-at-least-32-characters";
  return { enabled: true };
});

vi.mock("@/lib/sharing/feature-flag", () => ({
  get documentSharingEnabled() {
    return flag.enabled;
  },
}));

import { sessionOptions } from "@/lib/session";

import { POST } from "./route";

const string = (value: string) => ({ stringValue: value });
const timestamp = (value: string) => ({ timestampValue: value });

const recipientEntry = (email: string, status = "pending") => ({
  mapValue: {
    fields: {
      email: string(email),
      invitedAt: timestamp("2026-10-01T00:00:00.000Z"),
      status: string(status),
      ...(status === "revoked"
        ? { revokedAt: timestamp("2026-10-02T00:00:00.000Z") }
        : {}),
    },
  },
});

const sharedDocument = (
  overrides: {
    locked?: boolean;
    ownerId?: string;
    recipients?: ReturnType<typeof recipientEntry>[];
  } = {},
) => ({
  fields: {
    createdAt: timestamp("2026-10-01T00:00:00.000Z"),
    locked: { booleanValue: overrides.locked ?? false },
    name: string("NDA"),
    ownerEmail: string("owner@example.com"),
    ownerId: string(overrides.ownerId ?? "owner-uid"),
    ownerName: string("Owner"),
    recipients: {
      arrayValue: {
        values: overrides.recipients ?? [recipientEntry("bob@example.com")],
      },
    },
    signatures: { mapValue: { fields: {} } },
    sourceDocumentId: string("doc_1"),
    templateId: string("nda"),
    updatedAt: timestamp("2026-10-01T00:00:00.000Z"),
    values: { mapValue: { fields: {} } },
  },
  name: "projects/p/databases/(default)/documents/sharedDocuments/doc-1",
});

const sessionCookie = async (uid = "owner-uid") => {
  const sealed = await sealData(
    {
      absoluteExpiresAt: Date.now() + 3_600_000,
      expiresAt: Date.now() + 3_600_000,
      idToken: "h.e30.s",
      refreshToken: "refresh",
      user: {
        displayName: "Owner",
        email: "owner@example.com",
        emailVerified: true,
        provider: "password",
        role: "free",
        uid,
      },
    },
    { password: sessionOptions.password, ttl: 3600 },
  );
  return `${sessionOptions.cookieName}=${sealed}`;
};

const context = { params: Promise.resolve({ id: "doc-1" }) };

const post = async ({
  signedIn = true,
  uid,
}: { signedIn?: boolean; uid?: string } = {}) =>
  POST(
    new Request("http://localhost/api/documents/shared/doc-1/revoke", {
      headers: signedIn ? { cookie: await sessionCookie(uid) } : {},
      method: "POST",
    }),
    context,
  );

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

let patches: { body: { fields: Record<string, unknown> }; url: string }[];

/** Serves `existing` for the read and, for the write, echoes the patched fields back. */
const installFetch = (
  existing: ReturnType<typeof sharedDocument> | "absent",
  { writeDenied = false } = {},
) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        patches.push({
          body: JSON.parse(String(init.body)),
          url: String(input),
        });
        if (writeDenied) {
          return respond({ error: { status: "PERMISSION_DENIED" } }, 403);
        }
        const document = existing as ReturnType<typeof sharedDocument>;
        return respond({
          ...document,
          fields: {
            ...document.fields,
            ...(JSON.parse(String(init.body)) as { fields: object }).fields,
          },
        });
      }
      return existing === "absent" ? respond({}, 404) : respond(existing);
    }),
  );

beforeEach(() => {
  flag.enabled = true;
  patches = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/documents/shared/:id/revoke", () => {
  it("marks the recipient revoked and removes them from the access arrays", async () => {
    installFetch(sharedDocument());

    const response = await post();
    const { document } = await response.json();

    expect(response.status).toBe(200);
    expect(patches).toHaveLength(1);
    for (const field of [
      "recipientEmails",
      "recipientUids",
      "recipients",
      "updatedAt",
    ]) {
      expect(patches[0].url).toContain(`updateMask.fieldPaths=${field}`);
    }
    expect(patches[0].url).not.toContain("signatures");
    expect(patches[0].url).not.toContain("locked");
    expect(patches[0].body.fields.recipientEmails).toEqual({
      arrayValue: { values: [] },
    });
    expect(document.recipients[0]).toMatchObject({
      email: "bob@example.com",
      status: "revoked",
    });
    expect(document.recipients[0].revokedAt).toBeGreaterThan(0);
  });

  it("revokes only the active recipient and keeps earlier revoked ones", async () => {
    installFetch(
      sharedDocument({
        recipients: [
          recipientEntry("old@example.com", "revoked"),
          recipientEntry("bob@example.com"),
        ],
      }),
    );

    const { document } = await (await post()).json();

    expect(
      document.recipients.map(
        (recipient: { status: string }) => recipient.status,
      ),
    ).toEqual(["revoked", "revoked"]);
  });

  it("refuses with 409 once the document is signed and locked", async () => {
    installFetch(sharedDocument({ locked: true }));

    const response = await post();

    expect(response.status).toBe(409);
    expect(patches).toHaveLength(0);
  });

  it("refuses with 409 when nobody has access to revoke", async () => {
    installFetch(
      sharedDocument({
        recipients: [recipientEntry("bob@example.com", "revoked")],
      }),
    );

    const response = await post();

    expect(response.status).toBe(409);
    expect(patches).toHaveLength(0);
  });

  it("answers 409 when the rules refuse the write because it just locked", async () => {
    installFetch(sharedDocument(), { writeDenied: true });

    expect((await post()).status).toBe(409);
  });

  it("answers 404 for a document the caller does not own", async () => {
    installFetch(sharedDocument({ ownerId: "someone-else" }));

    const response = await post();

    expect(response.status).toBe(404);
    expect(patches).toHaveLength(0);
  });

  it("answers 404 for an unknown document", async () => {
    installFetch("absent");

    expect((await post()).status).toBe(404);
  });

  it("answers 401 without a session", async () => {
    installFetch(sharedDocument());

    expect((await post({ signedIn: false })).status).toBe(401);
  });

  it("answers 404 while sharing is switched off", async () => {
    flag.enabled = false;
    installFetch(sharedDocument());

    const response = await post();

    expect(response.status).toBe(404);
    expect(patches).toHaveLength(0);
  });
});
