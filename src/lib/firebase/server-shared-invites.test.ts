import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateInviteToken } from "@/lib/sharing/invite-token";
import type { AuthSession } from "@/types/auth";

beforeEach(() => {
  vi.stubEnv("FIREBASE_API_KEY", "test-key");
  vi.stubEnv("FIREBASE_PROJECT_ID", "test-project");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

import { acceptInvite, getInviteByToken } from "./server-shared-invites";

const string = (value: string) => ({ stringValue: value });
const timestamp = (ms: number) => ({
  timestampValue: new Date(ms).toISOString(),
});

const inviteDocument = (expiresAt: number, email = "bob@example.com") => ({
  fields: {
    createdAt: timestamp(1_000),
    email: string(email),
    expiresAt: timestamp(expiresAt),
    name: string("NDA"),
    ownerEmail: string("alice@example.com"),
    ownerId: string("owner-uid"),
    ownerName: string("Alice"),
    sharedDocumentId: string("s1"),
    values: { mapValue: { fields: {} } },
  },
  name: "projects/p/databases/(default)/documents/sharedInvites/hash",
});

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const session = (email: string) =>
  ({
    idToken: "h.e30.s",
    user: { email, uid: "bob-uid" },
  }) as unknown as AuthSession;

describe("getInviteByToken", () => {
  it("is invalid for a malformed token without calling Firestore", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await getInviteByToken("nope")).toEqual({ state: "invalid" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads the invite without a user token", async () => {
    const fetchMock = vi.fn(async () => respond(inviteDocument(5_000)));
    vi.stubGlobal("fetch", fetchMock);

    const lookup = await getInviteByToken(generateInviteToken().token, 2_000);

    expect(lookup.state).toBe("valid");
    const init = (
      fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    )[1];
    expect(JSON.stringify(init.headers)).not.toContain("Bearer");
  });

  it("is expired once the window has passed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respond(inviteDocument(5_000))),
    );

    expect(await getInviteByToken(generateInviteToken().token, 5_000)).toEqual({
      state: "expired",
    });
  });

  it("is invalid when the invite was deleted or is refused", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respond({ error: { status: "NOT_FOUND" } }, 404)),
    );
    expect(await getInviteByToken(generateInviteToken().token)).toEqual({
      state: "invalid",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        respond({ error: { status: "PERMISSION_DENIED" } }, 403),
      ),
    );
    expect(await getInviteByToken(generateInviteToken().token)).toEqual({
      state: "invalid",
    });
  });
});

describe("acceptInvite", () => {
  it("refuses another account and masks the invited address", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respond(inviteDocument(Date.now() + 60_000))),
    );

    const result = await acceptInvite(
      session("eve@example.com"),
      generateInviteToken().token,
    );

    expect(result).toMatchObject({ status: "mismatch" });
    expect(JSON.stringify(result)).not.toContain("bob@example.com");
  });

  it("reports an expired link without touching the document", async () => {
    const fetchMock = vi.fn(async () => respond(inviteDocument(1)));
    vi.stubGlobal("fetch", fetchMock);

    expect(
      await acceptInvite(
        session("bob@example.com"),
        generateInviteToken().token,
      ),
    ).toEqual({ status: "expired" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
