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

const OWNER_EMAIL = "owner@example.com";

type FirestoreStub = {
  ledger: string[];
  sharedDocument: "absent" | "denied" | Record<string, unknown>;
  signable: boolean;
  sourceDocument: boolean;
};

let stub: FirestoreStub;
let commits: { writes: { currentDocument?: { exists: boolean } }[] }[];
let commitStatus: number;

const string = (value: string) => ({ stringValue: value });
const timestamp = (value: string) => ({ timestampValue: value });

const buildUserDocument = (signable: boolean) => ({
  fields: {
    createdAt: timestamp("2026-10-01T00:00:00.000Z"),
    name: string("NDA"),
    templateId: string("nda"),
    templateSnapshot: {
      mapValue: {
        fields: {
          description: string(""),
          documentType: string("nda"),
          fields: {
            arrayValue: {
              values: [
                {
                  mapValue: {
                    fields: {
                      key: string(signable ? "recipientSignature" : "notes"),
                      label: string("Recipient signature"),
                      type: string("text"),
                    },
                  },
                },
              ],
            },
          },
          name: string("NDA"),
          style: { mapValue: { fields: { id: string("classic") } } },
        },
      },
    },
    updatedAt: timestamp("2026-10-01T00:00:00.000Z"),
    values: { mapValue: { fields: { party: string("Acme") } } },
  },
  name: "projects/p/databases/(default)/documents/users/owner-uid/documents/doc_1",
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const installFetch = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith(":commit")) {
        commits.push(JSON.parse(String(init?.body)));
        return commitStatus === 200
          ? json({})
          : json({ error: { status: "FAILED_PRECONDITION" } }, commitStatus);
      }
      if (url.includes("/users/owner-uid/documents/doc_1")) {
        return stub.sourceDocument
          ? json(buildUserDocument(stub.signable))
          : json({}, 404);
      }
      if (url.includes("/users/owner-uid/shareRecipients")) {
        return json({
          documents: stub.ledger.map((email) => ({
            fields: {
              email: string(email),
              firstSharedAt: timestamp("2026-09-01T00:00:00.000Z"),
              lastSharedAt: timestamp("2026-09-01T00:00:00.000Z"),
            },
            name: `projects/p/databases/(default)/documents/users/owner-uid/shareRecipients/${email}`,
          })),
        });
      }
      if (url.includes("/sharedDocuments/")) {
        if (stub.sharedDocument === "absent") return json({}, 404);
        if (stub.sharedDocument === "denied") {
          return json({ error: { status: "PERMISSION_DENIED" } }, 403);
        }
        return json(stub.sharedDocument);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }),
  );

const sharedDocument = (overrides: {
  locked?: boolean;
  recipientEmail?: string;
}) => ({
  fields: {
    createdAt: timestamp("2026-10-02T00:00:00.000Z"),
    locked: { booleanValue: overrides.locked ?? false },
    name: string("NDA"),
    ownerEmail: string(OWNER_EMAIL),
    ownerId: string("owner-uid"),
    ownerName: string("Owner"),
    recipients: {
      arrayValue: {
        values: [
          {
            mapValue: {
              fields: {
                email: string(overrides.recipientEmail ?? "bob@example.com"),
                invitedAt: timestamp("2026-10-02T00:00:00.000Z"),
                status: string("pending"),
              },
            },
          },
        ],
      },
    },
    signatures: { mapValue: { fields: {} } },
    sourceDocumentId: string("doc_1"),
    templateId: string("nda"),
    updatedAt: timestamp("2026-10-02T00:00:00.000Z"),
    values: { mapValue: { fields: {} } },
  },
  name: "projects/p/databases/(default)/documents/sharedDocuments/owner-uid_doc_1",
});

const sessionCookie = async () => {
  const sealed = await sealData(
    {
      absoluteExpiresAt: Date.now() + 3_600_000,
      expiresAt: Date.now() + 3_600_000,
      idToken: "h.e30.s",
      refreshToken: "refresh",
      user: {
        displayName: "Owner",
        email: OWNER_EMAIL,
        provider: "password",
        role: "free",
        uid: "owner-uid",
      },
    },
    { password: sessionOptions.password, ttl: 3600 },
  );
  return `${sessionOptions.cookieName}=${sealed}`;
};

const shareRequest = async (body: unknown, signedIn = true) =>
  new Request("http://localhost/api/documents/doc_1/share", {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...(signedIn ? { cookie: await sessionCookie() } : {}),
    },
    method: "POST",
  });

const context = { params: Promise.resolve({ id: "doc_1" }) };

const post = async (body: unknown, { signedIn = true } = {}) =>
  POST(await shareRequest(body, signedIn), context);

beforeEach(() => {
  flag.enabled = true;
  commits = [];
  commitStatus = 200;
  stub = {
    ledger: [],
    sharedDocument: "denied",
    signable: true,
    sourceDocument: true,
  };
  installFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/documents/:id/share", () => {
  it("creates the share and ledger entry in one commit for a new recipient", async () => {
    const response = await post({ email: "  Bob@Example.com " });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.sharedDocumentId).toBe("owner-uid_doc_1");
    expect(body.recipient).toEqual({
      email: "bob@example.com",
      status: "pending",
    });
    expect(commits).toHaveLength(1);
    expect(commits[0].writes.map((write) => write.currentDocument)).toEqual([
      { exists: false },
      { exists: false },
    ]);
  });

  it("treats an absent shared document the same as a refused read", async () => {
    stub.sharedDocument = "absent";

    expect((await post({ email: "bob@example.com" })).status).toBe(201);
  });

  it("is idempotent: sharing again with the same address updates in place", async () => {
    stub.sharedDocument = sharedDocument({});
    stub.ledger = ["bob@example.com"];

    const response = await post({ email: "BOB@example.com" });

    expect(response.status).toBe(200);
    expect(commits[0].writes.map((write) => write.currentDocument)).toEqual([
      { exists: true },
      { exists: true },
    ]);
  });

  it("rejects sharing with yourself", async () => {
    const response = await post({ email: "Owner@Example.com" });

    expect(response.status).toBe(400);
    expect(commits).toHaveLength(0);
  });

  it("returns 404 when the document does not exist or is not owned", async () => {
    stub.sourceDocument = false;

    expect((await post({ email: "bob@example.com" })).status).toBe(404);
    expect(commits).toHaveLength(0);
  });

  it("returns 400 when the document type has no recipient signature", async () => {
    stub.signable = false;

    expect((await post({ email: "bob@example.com" })).status).toBe(400);
    expect(commits).toHaveLength(0);
  });

  it("returns 401 without a session", async () => {
    expect(
      (await post({ email: "bob@example.com" }, { signedIn: false })).status,
    ).toBe(401);
  });

  it("returns 404 while the feature flag is off", async () => {
    flag.enabled = false;

    expect((await post({ email: "bob@example.com" })).status).toBe(404);
    expect(commits).toHaveLength(0);
  });

  it("returns 400 for a missing or malformed email", async () => {
    expect((await post({})).status).toBe(400);
    expect((await post({ email: "not-an-email" })).status).toBe(400);
  });

  it("returns 409 when the document is already shared with someone else", async () => {
    stub.sharedDocument = sharedDocument({
      recipientEmail: "carol@example.com",
    });

    const response = await post({ email: "bob@example.com" });

    expect(response.status).toBe(409);
    expect(commits).toHaveLength(0);
  });

  it("returns 409 once the shared document is locked", async () => {
    stub.sharedDocument = sharedDocument({ locked: true });

    const response = await post({ email: "bob@example.com" });

    expect(response.status).toBe(409);
    expect(commits).toHaveLength(0);
  });

  it("returns 409 when a concurrent request wins the commit", async () => {
    commitStatus = 409;

    expect((await post({ email: "bob@example.com" })).status).toBe(409);
  });
});

describe("POST /api/documents/:id/share with a plan limit", () => {
  it("returns 403 when a new recipient would exceed the limit", async () => {
    vi.resetModules();
    vi.doMock("@/lib/sharing/policy", async (importOriginal) => {
      const original =
        await importOriginal<typeof import("@/lib/sharing/policy")>();
      return {
        ...original,
        canShareWith: (input: Parameters<typeof original.canShareWith>[0]) =>
          original.canShareWith(input, {
            free: 1,
            gold: 1,
            silver: 1,
            special: 1,
            superadmin: 1,
          }),
      };
    });
    const { POST: limitedPost } = await import("./route");
    stub.ledger = ["alice@example.com"];

    const response = await limitedPost(
      await shareRequest({ email: "bob@example.com" }),
      context,
    );

    expect(response.status).toBe(403);
    expect(commits).toHaveLength(0);
    vi.doUnmock("@/lib/sharing/policy");
  });
});
