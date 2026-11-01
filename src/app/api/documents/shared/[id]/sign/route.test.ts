import { sealData } from "iron-session";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const flag = vi.hoisted(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.SESSION_SECRET = "a-test-secret-that-is-at-least-32-characters";
  return { enabled: true };
});

const email = vi.hoisted(() => ({
  notify: vi.fn(),
  scheduled: [] as (() => unknown)[],
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (callback: () => unknown) => email.scheduled.push(callback),
}));

vi.mock("@/lib/sharing/notify-document-signed", () => ({
  notifyDocumentSigned: email.notify,
}));

vi.mock("@/lib/sharing/feature-flag", () => ({
  get documentSharingEnabled() {
    return flag.enabled;
  },
}));

import { sessionOptions } from "@/lib/session";

import { POST } from "./route";

const string = (value: string) => ({ stringValue: value });
const timestamp = (value: string) => ({ timestampValue: value });

const sharedDocument = (
  overrides: {
    locked?: boolean;
    ownerId?: string;
    recipientEmail?: string;
    signatures?: Record<string, unknown>;
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
        values: [
          {
            mapValue: {
              fields: {
                email: string(overrides.recipientEmail ?? "bob@example.com"),
                invitedAt: timestamp("2026-10-01T00:00:00.000Z"),
                status: string("pending"),
              },
            },
          },
        ],
      },
    },
    signatures: { mapValue: { fields: overrides.signatures ?? {} } },
    sourceDocumentId: string("doc_1"),
    templateId: string("nda"),
    updatedAt: timestamp("2026-10-01T00:00:00.000Z"),
    values: { mapValue: { fields: {} } },
  },
  name: "projects/p/databases/(default)/documents/sharedDocuments/doc-1",
});

const sessionCookie = async (email = "Bob@Example.com", uid = "bob-uid") => {
  const sealed = await sealData(
    {
      absoluteExpiresAt: Date.now() + 3_600_000,
      expiresAt: Date.now() + 3_600_000,
      idToken: "h.e30.s",
      refreshToken: "refresh",
      user: {
        displayName: "Bob",
        email,
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

const post = async (
  body: unknown,
  {
    email,
    signedIn = true,
    uid,
  }: { email?: string; signedIn?: boolean; uid?: string } = {},
) =>
  POST(
    new Request("http://localhost/api/documents/shared/doc-1/sign", {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        ...(signedIn ? { cookie: await sessionCookie(email, uid) } : {}),
      },
      method: "POST",
    }),
    context,
  );

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

let patches: { body: Record<string, unknown>; url: string }[];

/** Serves `existing` for the read and, for the write, echoes the patched fields back. */
const installFetch = (
  existing: ReturnType<typeof sharedDocument> | "absent" | "denied",
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
      if (existing === "absent") return respond({}, 404);
      if (existing === "denied") {
        return respond({ error: { status: "PERMISSION_DENIED" } }, 403);
      }
      return respond(existing);
    }),
  );

beforeEach(() => {
  flag.enabled = true;
  patches = [];
  email.scheduled.length = 0;
  email.notify.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/documents/shared/:id/sign", () => {
  it("writes the signature and the lock together, then returns the signed document", async () => {
    installFetch(sharedDocument());

    const response = await post({ signature: "  Bob Smith  " });
    const { document } = await response.json();

    expect(response.status).toBe(200);
    expect(patches).toHaveLength(1);
    expect(patches[0].url).toContain("updateMask.fieldPaths=locked");
    expect(patches[0].url).toContain("updateMask.fieldPaths=signatures");
    expect(patches[0].url).toContain("updateMask.fieldPaths=updatedAt");
    expect(patches[0].body.fields).toMatchObject({
      locked: { booleanValue: true },
    });
    expect(document.locked).toBe(true);
    expect(document.signatures["bob-uid"]).toMatchObject({
      email: "bob@example.com",
      type: "typed",
      value: "Bob Smith",
    });
    expect(document.recipients[0].status).toBe("signed");
  });

  it("emails the owner in the background once the document is signed", async () => {
    installFetch(sharedDocument());

    await post({ signature: "Bob Smith" });
    expect(email.notify).not.toHaveBeenCalled();
    await Promise.all(email.scheduled.map((callback) => callback()));

    expect(email.notify).toHaveBeenCalledTimes(1);
    const [session, document] = email.notify.mock.calls[0];
    expect(session.user.uid).toBe("bob-uid");
    expect(document.locked).toBe(true);
    expect(document.signatures["bob-uid"].value).toBe("Bob Smith");
  });

  it("still signs when the email helper fails", async () => {
    installFetch(sharedDocument());
    email.notify.mockRejectedValue(new Error("boom"));

    const response = await post({ signature: "Bob Smith" });

    expect(response.status).toBe(200);
  });

  it("schedules no email for a refused or invalid sign", async () => {
    installFetch(sharedDocument({ locked: true }));
    await post({ signature: "Bob Smith" });
    installFetch("absent");
    await post({ signature: "Bob Smith" });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await post({});

    expect(email.scheduled).toHaveLength(0);
  });

  it("returns 409 and writes nothing when the document is already locked", async () => {
    installFetch(sharedDocument({ locked: true }));

    const response = await post({ signature: "Bob Smith" });

    expect(response.status).toBe(409);
    expect(patches).toHaveLength(0);
  });

  it("returns 409 when the rules refuse the write because it was locked meanwhile", async () => {
    installFetch(sharedDocument(), { writeDenied: true });

    expect((await post({ signature: "Bob Smith" })).status).toBe(409);
  });

  it("returns 404 for the owner, who cannot sign their own document", async () => {
    installFetch(sharedDocument());

    const response = await post(
      { signature: "Owner" },
      { email: "owner@example.com", uid: "owner-uid" },
    );

    expect(response.status).toBe(404);
    expect(patches).toHaveLength(0);
  });

  it("returns 404 when the document is not shared with the caller", async () => {
    installFetch("denied");

    expect((await post({ signature: "Bob Smith" })).status).toBe(404);
  });

  it("returns 404 when the document does not exist", async () => {
    installFetch("absent");

    expect((await post({ signature: "Bob Smith" })).status).toBe(404);
  });

  it("returns 400 for a missing, blank or over-long signature", async () => {
    installFetch(sharedDocument());
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect((await post({})).status).toBe(400);
    expect((await post({ signature: "   " })).status).toBe(400);
    expect((await post({ signature: "x".repeat(201) })).status).toBe(400);
    expect(patches).toHaveLength(0);
  });

  it("returns 401 without a session", async () => {
    installFetch(sharedDocument());

    expect((await post({ signature: "Bob" }, { signedIn: false })).status).toBe(
      401,
    );
  });

  it("returns 404 while the feature flag is off", async () => {
    flag.enabled = false;
    installFetch(sharedDocument());

    expect((await post({ signature: "Bob Smith" })).status).toBe(404);
    expect(patches).toHaveLength(0);
    expect(email.scheduled).toHaveLength(0);
  });
});
