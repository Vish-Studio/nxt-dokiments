import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/types/auth";
import type { PromoCode } from "@/types/promo";

import {
  listPromoRedemptions,
  redeemPromoCode,
} from "./server-promo-redemptions";

const PROMO: PromoCode = {
  code: "ViSHDOK2026!",
  description: "Use this code to unlock our launch offer on your account.",
  id: "launch-2026",
  label: "Launch Promo",
};

const session = {
  expiresAt: Date.now() + 60_000,
  idToken: "test-id-token",
  refreshToken: "test-refresh-token",
  user: {
    displayName: "Test User",
    email: "test@dokiments.local",
    provider: "password",
    role: "free",
    uid: "test-uid",
  },
} satisfies AuthSession;

/** The document path every request in these tests should be aimed at. */
const REDEMPTION_PATH = "/documents/users/test-uid/promoRedemptions/launch-2026";

/** A Firestore REST document as a read returns it. */
const redemptionDocument = (redeemedAt = "2026-08-30T09:00:00.000Z") =>
  new Response(
    JSON.stringify({
      fields: {
        code: { stringValue: "ViSHDOK2026!" },
        redeemedAt: { timestampValue: redeemedAt },
      },
      name: `projects/p/databases/(default)/documents/users/test-uid/promoRedemptions/launch-2026`,
    }),
    { status: 200 },
  );

/** Firestore's 404 for a document that does not exist. */
const notFound = () =>
  new Response(JSON.stringify({ error: { message: "Not found." } }), {
    status: 404,
  });

/** A successful write response. */
const written = () =>
  new Response(JSON.stringify({ fields: {} }), { status: 200 });

/** A Firestore error carrying a canonical `status`, as the REST API returns. */
const firestoreError = (status: string, httpStatus: number) =>
  new Response(
    JSON.stringify({ error: { message: `${status} message.`, status } }),
    { status: httpStatus },
  );

type FetchStub = (url: string | URL, init?: RequestInit) => Promise<Response>;

/** Replaces global fetch with a queue of responses, one per call. */
const stubFetch = (responses: Response[]) => {
  const spy = vi.fn<FetchStub>(async () => {
    const next = responses.shift();
    if (!next) throw new Error("fetch called more times than stubbed");
    return next;
  });
  vi.stubGlobal("fetch", spy);
  return spy;
};

/** The URL of the nth fetch call (0-indexed). */
const urlOf = (spy: ReturnType<typeof stubFetch>, call: number) =>
  String(spy.mock.calls[call][0]);

/** The parsed JSON body of the nth fetch call. */
const bodyOf = (spy: ReturnType<typeof stubFetch>, call: number) =>
  JSON.parse(String(spy.mock.calls[call][1]?.body));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listPromoRedemptions", () => {
  it("returns an empty array for an account that has redeemed nothing", async () => {
    stubFetch([new Response(JSON.stringify({}), { status: 200 })]);

    await expect(listPromoRedemptions(session)).resolves.toEqual([]);
  });

  it("parses a redemption, taking promoId from the document ID", async () => {
    stubFetch([
      new Response(
        JSON.stringify({
          documents: [
            {
              fields: {
                code: { stringValue: "ViSHDOK2026!" },
                redeemedAt: { timestampValue: "2026-08-30T09:00:00.000Z" },
              },
              name: "projects/p/databases/(default)/documents/users/test-uid/promoRedemptions/launch-2026",
            },
          ],
        }),
        { status: 200 },
      ),
    ]);

    await expect(listPromoRedemptions(session)).resolves.toEqual([
      {
        code: "ViSHDOK2026!",
        promoId: "launch-2026",
        redeemedAt: Date.parse("2026-08-30T09:00:00.000Z"),
      },
    ]);
  });

  it("reads the account's own subcollection", async () => {
    const spy = stubFetch([new Response(JSON.stringify({}), { status: 200 })]);

    await listPromoRedemptions(session);

    expect(urlOf(spy, 0)).toContain(
      "/documents/users/test-uid/promoRedemptions",
    );
  });
});

describe("redeemPromoCode", () => {
  it("writes the redemption and reports it when the account has not redeemed before", async () => {
    const spy = stubFetch([notFound(), written()]);

    const result = await redeemPromoCode(session, PROMO);

    expect(result.status).toBe("redeemed");
    expect(result).toMatchObject({
      redemption: { code: "ViSHDOK2026!", promoId: "launch-2026" },
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("stores the canonical registry code, never a user-typed variant", async () => {
    const spy = stubFetch([notFound(), written()]);

    await redeemPromoCode(session, PROMO);

    expect(bodyOf(spy, 1).fields.code).toEqual({ stringValue: "ViSHDOK2026!" });
  });

  it("stamps redeemedAt as a Firestore timestamp matching the returned epoch-ms", async () => {
    const spy = stubFetch([notFound(), written()]);

    const result = await redeemPromoCode(session, PROMO);

    if (result.status !== "redeemed") throw new Error("expected a redemption");

    expect(Date.parse(bodyOf(spy, 1).fields.redeemedAt.timestampValue)).toBe(
      result.redemption.redeemedAt,
    );
  });

  it("writes to the campaign's own document, so the ID is the once-per-account key", async () => {
    const spy = stubFetch([notFound(), written()]);

    await redeemPromoCode(session, PROMO);

    expect(urlOf(spy, 1)).toContain(REDEMPTION_PATH);
  });

  it("sends the create-only precondition, so Firestore refuses to overwrite", async () => {
    const spy = stubFetch([notFound(), written()]);

    await redeemPromoCode(session, PROMO);

    expect(urlOf(spy, 1)).toContain("currentDocument.exists=false");
    expect(spy.mock.calls[1][1]?.method).toBe("PATCH");
  });

  it("reports an existing redemption without attempting a write", async () => {
    const spy = stubFetch([redemptionDocument()]);

    await expect(redeemPromoCode(session, PROMO)).resolves.toEqual({
      status: "already_redeemed",
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  describe("when two requests for one account race past the initial read", () => {
    it("reports already_redeemed when the write is refused as ALREADY_EXISTS", async () => {
      stubFetch([notFound(), firestoreError("ALREADY_EXISTS", 409)]);

      await expect(redeemPromoCode(session, PROMO)).resolves.toEqual({
        status: "already_redeemed",
      });
    });

    it("reports already_redeemed when the write is refused as FAILED_PRECONDITION", async () => {
      stubFetch([notFound(), firestoreError("FAILED_PRECONDITION", 400)]);

      await expect(redeemPromoCode(session, PROMO)).resolves.toEqual({
        status: "already_redeemed",
      });
    });

    it("reports already_redeemed when rules reject the loser as an update and the record is now there", async () => {
      const spy = stubFetch([
        notFound(),
        firestoreError("PERMISSION_DENIED", 403),
        redemptionDocument(),
      ]);

      await expect(redeemPromoCode(session, PROMO)).resolves.toEqual({
        status: "already_redeemed",
      });
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  it("throws on a permission failure with no record written, rather than claiming the code was already used", async () => {
    // The undeployed-rules case. Reporting this as "already used for your account"
    // would tell every first-time user their code was spent.
    stubFetch([
      notFound(),
      firestoreError("PERMISSION_DENIED", 403),
      notFound(),
    ]);

    await expect(redeemPromoCode(session, PROMO)).rejects.toThrow(
      "PERMISSION_DENIED message.",
    );
  });

  it("propagates a write failure that carries no recognisable status", async () => {
    stubFetch([
      notFound(),
      new Response(JSON.stringify({ error: { message: "Boom." } }), {
        status: 500,
      }),
      notFound(),
    ]);

    await expect(redeemPromoCode(session, PROMO)).rejects.toThrow("Boom.");
  });

  it("propagates a failure of the initial read instead of writing blind", async () => {
    const spy = stubFetch([
      new Response(JSON.stringify({ error: { message: "Read failed." } }), {
        status: 500,
      }),
    ]);

    await expect(redeemPromoCode(session, PROMO)).rejects.toThrow(
      "Read failed.",
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
