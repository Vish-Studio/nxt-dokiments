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

import { GET as getOne } from "./[id]/route";
import { GET as getList } from "./route";

const string = (value: string) => ({ stringValue: value });
const timestamp = (value: string) => ({ timestampValue: value });

const sharedDocument = (id: string, updatedAt: string) => ({
  fields: {
    createdAt: timestamp("2026-10-01T00:00:00.000Z"),
    locked: { booleanValue: false },
    name: string(`Doc ${id}`),
    ownerEmail: string("owner@example.com"),
    ownerId: string("owner-uid"),
    ownerName: string("Owner"),
    recipients: { arrayValue: {} },
    signatures: { mapValue: { fields: {} } },
    sourceDocumentId: string(id),
    templateId: string("nda"),
    updatedAt: timestamp(updatedAt),
    values: { mapValue: { fields: {} } },
  },
  name: `projects/p/databases/(default)/documents/sharedDocuments/${id}`,
});

const sessionCookie = async (emailVerified: boolean) => {
  const sealed = await sealData(
    {
      absoluteExpiresAt: Date.now() + 3_600_000,
      expiresAt: Date.now() + 3_600_000,
      idToken: "h.e30.s",
      refreshToken: "refresh",
      user: {
        displayName: "Bob",
        email: "Bob@Example.com",
        emailVerified,
        provider: "password",
        role: "free",
        uid: "bob-uid",
      },
    },
    { password: sessionOptions.password, ttl: 3600 },
  );
  return `${sessionOptions.cookieName}=${sealed}`;
};

const request = async (emailVerified = true, signedIn = true) =>
  new Request("http://localhost/api/documents/shared", {
    headers: signedIn ? { cookie: await sessionCookie(emailVerified) } : {},
  });

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

let queries: unknown[];

beforeEach(() => {
  flag.enabled = true;
  queries = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/documents/shared", () => {
  it("queries by the caller's normalised address and returns newest first", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL, init?: RequestInit) => {
        queries.push(JSON.parse(String(init?.body)));
        return respond([
          { document: sharedDocument("older", "2026-10-02T00:00:00.000Z") },
          { document: sharedDocument("newer", "2026-10-03T00:00:00.000Z") },
          { readTime: "2026-10-04T00:00:00.000Z" },
        ]);
      }),
    );

    const response = await getList(await request(), undefined);
    const { documents } = await response.json();

    expect(response.status).toBe(200);
    expect(documents.map((document: { id: string }) => document.id)).toEqual([
      "newer",
      "older",
    ]);
    expect(queries[0]).toMatchObject({
      structuredQuery: {
        where: {
          fieldFilter: {
            field: { fieldPath: "recipientEmails" },
            op: "ARRAY_CONTAINS",
            value: { stringValue: "bob@example.com" },
          },
        },
      },
    });
  });

  it("returns an empty list when the rules refuse an unverified account", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        respond({ error: { status: "PERMISSION_DENIED" } }, 403),
      ),
    );

    const response = await getList(await request(false), undefined);

    expect(response.status).toBe(200);
    expect((await response.json()).documents).toEqual([]);
  });

  it("surfaces a refusal for a verified account instead of hiding it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        respond({ error: { status: "PERMISSION_DENIED" } }, 403),
      ),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect((await getList(await request(true), undefined)).status).toBe(500);
  });

  it("returns 401 without a session", async () => {
    expect((await getList(await request(true, false), undefined)).status).toBe(
      401,
    );
  });

  it("returns 404 while the feature flag is off", async () => {
    flag.enabled = false;

    expect((await getList(await request(), undefined)).status).toBe(404);
  });
});

describe("GET /api/documents/shared/:id", () => {
  const context = { params: Promise.resolve({ id: "doc-1" }) };

  it("returns the document", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        respond(sharedDocument("doc-1", "2026-10-02T00:00:00.000Z")),
      ),
    );

    const response = await getOne(await request(), context);

    expect(response.status).toBe(200);
    expect((await response.json()).document.id).toBe("doc-1");
  });

  it("returns 404 when the rules refuse the read (stranger or absent)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        respond({ error: { status: "PERMISSION_DENIED" } }, 403),
      ),
    );

    expect((await getOne(await request(), context)).status).toBe(404);
  });

  it("returns 404 when the document does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respond({}, 404)),
    );

    expect((await getOne(await request(), context)).status).toBe(404);
  });

  it("returns 404 while the feature flag is off", async () => {
    flag.enabled = false;

    expect((await getOne(await request(), context)).status).toBe(404);
  });

  it("returns 401 without a session", async () => {
    expect((await getOne(await request(true, false), context)).status).toBe(
      401,
    );
  });
});
