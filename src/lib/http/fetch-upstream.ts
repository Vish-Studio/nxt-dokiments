import "server-only";

/**
 * Thrown when an upstream request could not be delivered at all — DNS failure,
 * connection refused, or a connect timeout that survived every retry.
 *
 * Distinct from a non-2xx response on purpose: this means we never reached the
 * provider, so callers must not report it as a rejection by that provider (a
 * network blip is not a wrong password, and it does not invalidate a token).
 * `handleApiError` maps it to a `503`.
 *
 * The original failure is preserved as `cause` so server logs keep the real
 * diagnostic while the `message` stays safe to show a user.
 */
export class UpstreamUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "UpstreamUnavailableError";
  }
}

/**
 * Error codes that prove the request was **never delivered**: the socket was
 * never established, so the upstream service did not see the request.
 *
 * That is what makes retrying safe regardless of HTTP method. It matters
 * concretely — `exchangeGoogleCode` spends a single-use authorization code and
 * `patchFirestoreDocument` writes user data, so re-sending either *after*
 * delivery would be a correctness bug, not just wasted work.
 */
const RETRYABLE_CONNECT_CODES = new Set([
  // The connect race timed out on every address family. This is the common one:
  // Node's default per-family budget is only 250ms. See `src/instrumentation.ts`.
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  // DNS temporary failure — retrying a moment later routinely succeeds.
  "EAI_AGAIN",
]);

const MAX_ATTEMPTS = 3;
const FIRST_BACKOFF_MS = 150;
const BACKOFF_FACTOR = 3;
const BACKOFF_JITTER = 0.25;

/**
 * Per-attempt ceiling. Well clear of normal latency to these APIs (a slow but
 * successful Firestore call has been observed at ~2.7s) so it only fires on a
 * genuinely stuck connection.
 *
 * Kept below `TOTAL_BUDGET_MS` deliberately. A host that silently drops packets
 * never errors — it just hangs — so this timeout is the only thing that ends the
 * attempt, and if it matched the total budget a single hung connection would spend
 * the entire allowance and leave no room to retry.
 */
const ATTEMPT_TIMEOUT_MS = 5_000;

/**
 * Ceiling on the whole retry sequence, backoff included.
 *
 * Needed because a single failing attempt is not cheap: a 2s connect budget
 * across two address families burns ~4s, so three unbounded attempts plus
 * backoff could reach ~13s and trip a serverless function timeout (Vercel's
 * default is 10-15s). Better to give up at 8s and return a 503 the client can
 * retry than to be killed by the platform mid-request.
 */
const TOTAL_BUDGET_MS = 8_000;

/**
 * Collects error codes from a failed `fetch`.
 *
 * undici reports connection failures as `TypeError: fetch failed` with the real
 * error on `cause`. When Node's connect race is involved, that cause is an
 * `AggregateError` — and the code may sit on the aggregate itself, on its
 * sub-errors, or both, so all of them are checked.
 */
const causeCodes = (error: unknown): string[] => {
  const cause = error instanceof Error ? error.cause : undefined;
  const candidates = [
    cause,
    ...(cause instanceof AggregateError ? cause.errors : []),
  ];

  return candidates.flatMap((candidate) =>
    candidate && typeof candidate === "object" && "code" in candidate
      ? [String((candidate as { code: unknown }).code)]
      : [],
  );
};

/**
 * Whether a thrown value is an undelivered-request failure, and so safe to retry.
 *
 * Deliberately narrow. These are **not** retried:
 * - Any HTTP response, including 5xx and 429 — the request *was* delivered, and
 *   a write may already have been applied upstream.
 * - `ECONNRESET` / `UND_ERR_SOCKET` — the socket can drop after the request was
 *   sent, so delivery is unknown.
 * - `AbortError` from our own `ATTEMPT_TIMEOUT_MS` — delivery is ambiguous by
 *   definition; we timed out waiting for a reply that may already be in flight.
 */
const isUndeliveredRequestError = (error: unknown): boolean =>
  causeCodes(error).some((code) => RETRYABLE_CONNECT_CODES.has(code));

/** Backoff for the given retry index, with jitter to avoid lock-step retries. */
const backoffMs = (attempt: number): number => {
  const base = FIRST_BACKOFF_MS * BACKOFF_FACTOR ** (attempt - 1);
  return Math.round(base * (1 + (Math.random() * 2 - 1) * BACKOFF_JITTER));
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * `fetch` for third-party APIs, with a per-attempt timeout and retries limited to
 * failures where the request provably never left this process.
 *
 * Success and non-2xx responses are returned untouched — callers keep full
 * control over status handling. Only transport failures are translated, into
 * `UpstreamUnavailableError`.
 *
 * @param url - Fully-qualified request URL.
 * @param init - Standard `fetch` init. A `signal` here is not supported; the
 *   helper installs its own per-attempt timeout signal.
 * @returns The upstream `Response`, whatever its status.
 * @throws {UpstreamUnavailableError} When the request could not be delivered, or
 *   when a per-attempt timeout fired.
 */
export const fetchUpstream = async (
  url: string | URL,
  init?: Omit<RequestInit, "signal">,
): Promise<Response> => {
  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    // Cap each attempt by whatever is left of the overall budget, so the total is
    // genuinely bounded. Checking only the backoff delay wouldn't be enough — a late
    // attempt could still run for the full per-attempt timeout and overshoot.
    const remainingBudget = TOTAL_BUDGET_MS - (Date.now() - startedAt);
    if (remainingBudget <= 0) {
      break;
    }

    try {
      return await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(
          Math.min(ATTEMPT_TIMEOUT_MS, remainingBudget),
        ),
      });
    } catch (error) {
      lastError = error;

      if (!isUndeliveredRequestError(error)) {
        break;
      }

      if (attempt === MAX_ATTEMPTS) {
        break;
      }

      // Don't start an attempt we can't afford to finish.
      const delay = backoffMs(attempt);
      if (Date.now() - startedAt + delay >= TOTAL_BUDGET_MS) {
        break;
      }

      await sleep(delay);
    }
  }

  throw new UpstreamUnavailableError(
    "Couldn't reach an external service. Please try again in a moment.",
    { cause: lastError },
  );
};
