import { sealData } from "iron-session";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const flag = vi.hoisted(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.SESSION_SECRET = "a-test-secret-that-is-at-least-32-characters";
  return { enabled: true };
});

const background = vi.hoisted(() => ({
  scheduled: [] as (() => unknown)[],
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (callback: () => unknown) => background.scheduled.push(callback),
}));

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

const request = async (
  emailVerified = true,
  signedIn = true,
  url = "http://localhost/api/documents/shared",
) =>
  new Request(url, {
    headers: signedIn ? { cookie: await sessionCookie(emailVerified) } : {},
  });

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

let queries: unknown[];

beforeEach(() => {
  flag.enabled = true;
  queries = [];
  background.scheduled.length = 0;
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

  it("lists the caller's own shares with ?by=me, matched on the owner", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL, init?: RequestInit) => {
        queries.push(JSON.parse(String(init?.body)));
        return respond([
          { document: sharedDocument("mine", "2026-10-02T00:00:00.000Z") },
        ]);
      }),
    );

    const response = await getList(
      await request(true, true, "http://localhost/api/documents/shared?by=me"),
      undefined,
    );

    expect(response.status).toBe(200);
    expect((await response.json()).documents).toHaveLength(1);
    expect(queries[0]).toMatchObject({
      structuredQuery: {
        where: {
          fieldFilter: {
            field: { fieldPath: "ownerId" },
            op: "EQUAL",
            value: { stringValue: "bob-uid" },
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

  describe("recording the first view", () => {
    const forBob = (
      overrides: {
        locked?: boolean;
        status?: string;
        views?: Record<string, unknown>;
      } = {},
    ) => {
      const document = sharedDocument("doc-1", "2026-10-02T00:00:00.000Z");
      return {
        ...document,
        fields: {
          ...document.fields,
          locked: { booleanValue: overrides.locked ?? false },
          recipients: {
            arrayValue: {
              values: [
                {
                  mapValue: {
                    fields: {
                      email: string("bob@example.com"),
                      invitedAt: timestamp("2026-10-01T00:00:00.000Z"),
                      status: string(overrides.status ?? "pending"),
                    },
                  },
                },
              ],
            },
          },
          ...(overrides.views
            ? { views: { mapValue: { fields: overrides.views } } }
            : {}),
        },
      };
    };

    const install = (document: ReturnType<typeof forBob>) => {
      const patches: { body: unknown; url: string }[] = [];
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string | URL, init?: RequestInit) => {
          if (init?.method === "PATCH") {
            patches.push({
              body: JSON.parse(String(init.body)),
              url: String(url),
            });
            return respond(document);
          }
          return respond(document);
        }),
      );
      return patches;
    };

    const open = async () => {
      const response = await getOne(await request(), {
        params: Promise.resolve({ id: "doc-1" }),
      });
      await Promise.all(background.scheduled.map((callback) => callback()));
      return response;
    };

    it("records the recipient's view in the background, touching only views", async () => {
      const patches = install(forBob());

      const response = await open();

      expect(response.status).toBe(200);
      expect(patches).toHaveLength(1);
      expect(patches[0].url).toContain("updateMask.fieldPaths=views");
      expect(patches[0].url).not.toContain("updatedAt");
      expect(patches[0].body).toMatchObject({
        fields: {
          views: {
            mapValue: {
              fields: {
                "bob-uid": {
                  mapValue: {
                    fields: { email: { stringValue: "bob@example.com" } },
                  },
                },
              },
            },
          },
        },
      });
    });

    it("does not record a second view", async () => {
      const patches = install(
        forBob({
          views: {
            "bob-uid": {
              mapValue: {
                fields: {
                  email: string("bob@example.com"),
                  viewedAt: timestamp("2026-10-02T00:00:00.000Z"),
                },
              },
            },
          },
        }),
      );

      await open();

      expect(patches).toHaveLength(0);
    });

    it("does not record a view once the document is locked", async () => {
      const patches = install(forBob({ locked: true }));

      await open();

      expect(patches).toHaveLength(0);
    });

    it("does not record a view for the owner or someone who is not a recipient", async () => {
      const patches = install(
        sharedDocument("doc-1", "2026-10-02T00:00:00.000Z") as ReturnType<
          typeof forBob
        >,
      );

      await open();

      expect(patches).toHaveLength(0);
    });

    it("does not record a view for a revoked recipient", async () => {
      const patches = install(forBob({ status: "revoked" }));

      await open();

      expect(patches).toHaveLength(0);
    });

    it("still returns the document when recording the view fails", async () => {
      const document = forBob();
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      vi.stubGlobal(
        "fetch",
        vi.fn(async (_url: string | URL, init?: RequestInit) =>
          init?.method === "PATCH"
            ? respond({ error: { status: "INTERNAL" } }, 500)
            : respond(document),
        ),
      );

      const response = await open();

      expect(response.status).toBe(200);
      expect((await response.json()).document.id).toBe("doc-1");
    });
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
