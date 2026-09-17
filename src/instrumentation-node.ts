import net from "node:net";

/**
 * Node-runtime-only startup side effects. Loaded via a dynamic import from
 * `register()` in `src/instrumentation.ts`, never imported statically — Next
 * bundles `instrumentation.ts` for the Edge runtime too, and would reject a
 * `node:net` import there even behind a runtime check it can't statically prove.
 */

// Node races one connection attempt per address family (Happy Eyeballs) and gives each
// just 250ms by default. On a slow or VPN'd path to *.googleapis.com that gets overrun
// routinely, and Node then fails the whole connection with an ETIMEDOUT AggregateError
// carrying one sub-error per family — surfacing as an opaque `TypeError: fetch failed`
// from every Firestore/Identity call.
//
// 2s still fails fast against a genuinely dead host, but survives a slow handshake.
// Retries in `fetchUpstream` cover what's left; this just stops manufacturing failures
// out of ordinary latency.
net.setDefaultAutoSelectFamilyAttemptTimeout(2_000);
