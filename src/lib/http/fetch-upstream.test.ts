import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchUpstream, UpstreamUnavailableError } from "./fetch-upstream";

/**
 * Builds the failure undici produces when a connection can't be established:
 * `TypeError: fetch failed` with the real error on `cause`.
 */
const connectFailure = (cause: unknown) =>
  new TypeError("fetch failed", { cause });

/** A code-carrying error, as Node's net layer produces. */
const codedError = (code: string) => Object.assign(new Error(code), { code });

/**
 * The shape actually observed in the wild: Node's Happy Eyeballs race fails both
 * address families and reports an `AggregateError` with one sub-error per family.
 */
const connectRaceFailure = ({
  aggregateCode,
  childCodes,
}: {
  aggregateCode?: string;
  childCodes: string[];
}) => {
  const aggregate = new AggregateError(childCodes.map(codedError), "");
  if (aggregateCode) {
    Object.assign(aggregate, { code: aggregateCode });
  }
  return connectFailure(aggregate);
};

const okResponse = () => new Response("{}", { status: 200 });

/** Call signature of the stub, so `spy.mock.calls` is typed as fetch's arguments. */
type FetchStub = (url: string | URL, init?: RequestInit) => Promise<Response>;

/** Replaces global fetch with a queue of outcomes, one per call. */
const stubFetch = (outcomes: Array<Response | Error>) => {
  const spy = vi.fn<FetchStub>(async () => {
    const outcome = outcomes.shift();
    if (outcome === undefined) throw new Error("fetch called more times than stubbed");
    if (outcome instanceof Error) throw outcome;
    return outcome;
  });
  vi.stubGlobal("fetch", spy);
  return spy;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fetchUpstream", () => {
  it("returns the response without retrying when the first attempt succeeds", async () => {
    const response = okResponse();
    const spy = stubFetch([response]);

    await expect(fetchUpstream("https://example.test")).resolves.toBe(response);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("retries an ETIMEDOUT connect race, then returns the successful response", async () => {
    const response = okResponse();
    const spy = stubFetch([
      connectRaceFailure({ aggregateCode: "ETIMEDOUT", childCodes: ["ETIMEDOUT", "ETIMEDOUT"] }),
      response,
    ]);

    await expect(fetchUpstream("https://example.test")).resolves.toBe(response);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("reads the code off AggregateError sub-errors when the aggregate itself has none", async () => {
    const response = okResponse();
    const spy = stubFetch([
      connectRaceFailure({ childCodes: ["ETIMEDOUT", "ETIMEDOUT"] }),
      response,
    ]);

    await expect(fetchUpstream("https://example.test")).resolves.toBe(response);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it.each(["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"])(
    "retries %s, which also proves the request was never delivered",
    async (code) => {
      const response = okResponse();
      const spy = stubFetch([connectFailure(codedError(code)), response]);

      await expect(fetchUpstream("https://example.test")).resolves.toBe(response);
      expect(spy).toHaveBeenCalledTimes(2);
    },
  );

  it("gives up after 3 attempts and throws UpstreamUnavailableError, keeping the cause", async () => {
    const finalFailure = connectFailure(codedError("ETIMEDOUT"));
    const spy = stubFetch([
      connectFailure(codedError("ETIMEDOUT")),
      connectFailure(codedError("ETIMEDOUT")),
      finalFailure,
    ]);

    const error = await fetchUpstream("https://example.test").catch((caught) => caught);

    expect(error).toBeInstanceOf(UpstreamUnavailableError);
    expect((error as UpstreamUnavailableError).cause).toBe(finalFailure);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it("retries a POST on a connect failure — safe because nothing was delivered", async () => {
    const response = okResponse();
    const spy = stubFetch([connectFailure(codedError("ECONNREFUSED")), response]);

    await expect(
      fetchUpstream("https://example.test", { method: "POST", body: "code=abc" }),
    ).resolves.toBe(response);
    expect(spy).toHaveBeenCalledTimes(2);
    // The retry must resend the caller's init verbatim, minus our own signal.
    expect(spy.mock.calls[1]?.[1]).toMatchObject({ method: "POST", body: "code=abc" });
  });

  describe("does not retry, because the request may already have been delivered", () => {
    it.each([500, 502, 429])("returns a %i response untouched", async (status) => {
      const response = new Response("{}", { status });
      const spy = stubFetch([response]);

      await expect(fetchUpstream("https://example.test")).resolves.toBe(response);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("does not retry ECONNRESET — the socket can drop after the request was sent", async () => {
      const spy = stubFetch([connectFailure(codedError("ECONNRESET"))]);

      await expect(fetchUpstream("https://example.test")).rejects.toBeInstanceOf(
        UpstreamUnavailableError,
      );
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("does not retry our own attempt timeout — delivery is ambiguous", async () => {
      const abort = Object.assign(new Error("The operation was aborted"), {
        name: "TimeoutError",
      });
      const spy = stubFetch([abort]);

      await expect(fetchUpstream("https://example.test")).rejects.toBeInstanceOf(
        UpstreamUnavailableError,
      );
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("does not retry a failure with no recognisable code", async () => {
      const spy = stubFetch([connectFailure(new Error("something else"))]);

      await expect(fetchUpstream("https://example.test")).rejects.toBeInstanceOf(
        UpstreamUnavailableError,
      );
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  it("passes an abort signal so a stuck connection can't hang forever", async () => {
    const spy = stubFetch([okResponse()]);

    await fetchUpstream("https://example.test");

    expect(spy.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("bounds the whole sequence by the total budget rather than using every attempt", async () => {
    // Each attempt fails on a retryable code but burns most of the 8s budget, so the
    // sequence must give up early instead of spending all 3 attempts.
    let now = 0;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const spy = vi.fn(async () => {
      now += 7_000;
      throw connectFailure(codedError("ETIMEDOUT"));
    });
    vi.stubGlobal("fetch", spy);

    await expect(fetchUpstream("https://example.test")).rejects.toBeInstanceOf(
      UpstreamUnavailableError,
    );

    expect(spy.mock.calls.length).toBeLessThan(3);
  });

  it("shrinks a late attempt's timeout to what's left of the budget", async () => {
    let now = 0;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");
    const spy = vi.fn(async () => {
      now += 7_000;
      throw connectFailure(codedError("ETIMEDOUT"));
    });
    vi.stubGlobal("fetch", spy);

    await fetchUpstream("https://example.test").catch(() => undefined);

    // First attempt gets the standard per-attempt ceiling; the second only the ~1s
    // of budget left, so a stuck connection can't push the total past the ceiling.
    const [first, second] = timeoutSpy.mock.calls.map(([ms]) => ms as number);
    expect(first).toBe(5_000);
    expect(second).toBeLessThanOrEqual(1_000);
    timeoutSpy.mockRestore();
  });
});
