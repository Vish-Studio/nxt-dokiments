import { sealData } from "iron-session";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.SESSION_SECRET = "a-test-secret-that-is-at-least-32-characters";
});

import { sessionOptions } from "@/lib/session";

import { POST } from "./route";

type Stub = {
  name: string;
  snapshot: boolean;
  source: boolean;
  values: Record<string, string>;
};

let stub: Stub;
let writes: { url: string; body: unknown }[];

const string = (value: string) => ({ stringValue: value });
const timestamp = (value: string) => ({ timestampValue: value });

const buildSource = () => ({
  fields: {
    createdAt: timestamp("2026-10-01T00:00:00.000Z"),
    name: string(stub.name),
    templateId: string("invoice"),
    ...(stub.snapshot
      ? {
          templateSnapshot: {
            mapValue: {
              fields: {
                description: string("Bill a client"),
                documentType: string("invoice"),
                fields: {
                  arrayValue: {
                    values: [
                      {
                        mapValue: {
                          fields: {
                            key: string("title"),
                            label: string("Title"),
                            type: string("text"),
                          },
                        },
                      },
                    ],
                  },
                },
                name: string("Invoice"),
                style: { mapValue: { fields: { id: string("classic") } } },
              },
            },
          },
        }
      : {}),
    updatedAt: timestamp("2026-10-02T00:00:00.000Z"),
    values: {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(stub.values).map(([key, value]) => [
            key,
            string(value),
          ]),
        ),
      },
    },
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

      if (init?.method === "PATCH") {
        const body = JSON.parse(String(init.body)) as object;
        writes.push({ body, url });
        return json(body);
      }
      if (url.includes("/users/owner-uid/documents/doc_1")) {
        return stub.source ? json(buildSource()) : json({}, 404);
      }
      return json({}, 404);
    }),
  );

const sessionCookie = async () => {
  const sealed = await sealData(
    {
      absoluteExpiresAt: Date.now() + 3_600_000,
      expiresAt: Date.now() + 3_600_000,
      idToken: "h.e30.s",
      refreshToken: "refresh",
      user: {
        displayName: "Owner",
        email: "owner@example.com",
        provider: "password",
        role: "free",
        uid: "owner-uid",
      },
    },
    { password: sessionOptions.password, ttl: 3600 },
  );
  return `${sessionOptions.cookieName}=${sealed}`;
};

const draft = {
  name: "Copy of June Retainer",
  values: { notes: "Net 45", title: "Copy of Lumina Invoice" },
};

const post = async (signedIn = true, body: unknown = draft) =>
  POST(
    new Request("http://localhost/api/documents/doc_1/duplicate", {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...(signedIn ? { cookie: await sessionCookie() } : {}),
      },
      method: "POST",
    }),
    { params: Promise.resolve({ id: "doc_1" }) },
  );

beforeEach(() => {
  writes = [];
  stub = {
    name: "June Retainer",
    snapshot: true,
    source: true,
    values: { notes: "Net 30", title: "Lumina Invoice" },
  };
  installFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/documents/:id/duplicate", () => {
  it("creates a new document that keeps the saved snapshot and template", async () => {
    const response = await post();

    expect(response.status).toBe(201);
    const { document } = await response.json();
    expect(document.id).not.toBe("doc_1");
    expect(document.templateId).toBe("invoice");
    expect(document.templateSnapshot.name).toBe("Invoice");
    expect(document.templateSnapshot.fields).toEqual([
      { key: "title", label: "Title", type: "text" },
    ]);
    expect(writes).toHaveLength(1);
    expect(writes[0].url).toContain(
      `/users/owner-uid/documents/${document.id}`,
    );
  });

  it("saves the edited name and values it was given", async () => {
    const { document } = await (await post()).json();

    expect(document.name).toBe("Copy of June Retainer");
    expect(document.values).toEqual({
      notes: "Net 45",
      title: "Copy of Lumina Invoice",
    });
  });

  it("rejects a missing or oversized body with 400 and writes nothing", async () => {
    const missing = await post(true, {});
    const longName = await post(true, {
      name: "x".repeat(201),
      values: {},
    });

    expect(missing.status).toBe(400);
    expect(longName.status).toBe(400);
    expect(writes).toHaveLength(0);
  });

  it("never writes to the original document", async () => {
    await post();

    expect(writes.every((write) => !write.url.includes("/doc_1"))).toBe(true);
  });

  it("answers 404 and writes nothing when the document is missing", async () => {
    stub.source = false;

    const response = await post();

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Document not found." });
    expect(writes).toHaveLength(0);
  });

  it("answers 404 for a legacy document without a template snapshot", async () => {
    stub.snapshot = false;

    const response = await post();

    expect(response.status).toBe(404);
    expect(writes).toHaveLength(0);
  });

  it("answers 401 without a session", async () => {
    const response = await post(false);

    expect(response.status).toBe(401);
    expect(writes).toHaveLength(0);
  });
});
