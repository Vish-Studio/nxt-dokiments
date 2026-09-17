# API Reference — Feedback

`/api/feedback` — in-app feedback and problem reports from signed-in users, stored for an administrator to read.

Separate from [`api-templates-documents.md`](./api-templates-documents.md) because this is not part of the document pipeline: nothing references a feedback record, and no feedback record references anything.

The design decisions and the phased rollout live in `docs/plans/feedback-feature.md` and `docs/plans/feedback-feature-confluence.md`, which are **not committed** (`docs/plans/*` is gitignored) — the latter is published to Confluence. Everything needed to work on this route is repeated here.

## Firestore shape backing this route

```
feedback/{feedbackId}                      — one submission; doc ID server-generated, append-only
users/{uid}/feedbackMeta/latest            — that user's rate-limit state (lastFeedbackAt, count)
```

**`feedback` is top-level, and it is the only per-user collection in this app that is.** Every other one lives under `users/{uid}` because only its owner ever reads it. Feedback inverts that: the whole point is for an administrator to read *everyone's*, and reading a subcollection across all users requires a Firestore collection-group query, which [`server-firestore.ts`](../src/lib/firebase/server-firestore.ts) does not implement. A subcollection would have made the deferred admin screen a data-layer project rather than a UI one.

The cost is that ownership is no longer implied by the path, so it has to be asserted on the record instead — `request.resource.data.uid == request.auth.uid` in [`firestore.rules`](../firestore.rules) is the load-bearing line for this feature.

---

## `/api/feedback`

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `POST` | `/api/feedback` | Store one piece of feedback or one problem report from the signed-in account. | Session required (`401` if absent). No role gating — every signed-in user may send feedback. | `{ type: "feedback" \| "problem", message: string, path?: string }` — `message` trimmed, 1–2000 chars; `path` ≤ 512 chars. | `201 { feedback: FeedbackEntry }` / `400` on a malformed body, an empty or whitespace-only message, or one over 2000 chars / `429` inside the one-minute window / `503` if Firestore is unreachable. | `POST` to create a new record with a server-generated ID. Not idempotent, and deliberately so: a user who sends two messages meant to send two messages. |

**There is no `GET`, no `PATCH` and no `DELETE`.** Reading submissions is an administrator action, done through the Firebase console until an admin screen exists — [`listFeedback`](../src/lib/firebase/server-feedback.ts) is written and ready but not exposed over HTTP, because an endpoint with no consumer is an attack surface with no upside. `PATCH`/`DELETE` are absent because the collection is append-only (below).

### Who the sender is, is never asked

`uid`, `email` and `displayName` are read off `session.user`; the request body carries none of them and could not be trusted if it did. The rules assert the same `uid` independently, so feedback cannot be submitted in someone else's name even if this route had a bug.

`email` and `displayName` are **denormalised copies** taken at write time rather than resolved from `users/{uid}` on read. Whoever reviews a submission should know who sent it without a join — and a reviewer working in the Firebase console has no join available to them at all. The consequence is that a record shows the name and address as they stood when it was sent, which is the more useful fact anyway.

Both are clamped to the ceilings the rules assert (200 and 254 characters). Nothing in this app bounds `displayName` — `POST /api/auth/update-profile` takes it straight off the request body with no Zod schema — so without that clamp a long-named account would have every submission refused by the rules and reported as a `500`. Clamping makes the record satisfy the rules by construction. Losing the tail of an unusual display name costs a reviewer nothing; losing the feedback would.

### Append-only, by the database

Rules grant `create` and (superadmin) `read` on `feedback/{feedbackId}`, and deliberately no `update` and no `delete`. A record its author could later edit or erase is not a record, and there is no product reason to allow either.

That also removes the need for the create-only write `redeemPromoCode` uses: the document ID is freshly minted per call (`feedback_{base36 time}_{random}`, the same scheme `documents` and `clients` use) so there is nothing to collide with, and the rules make overwriting an existing record impossible regardless.

The field assertions in the rules bound a record from both directions: `hasOnly()` caps the key set, and each `is string` / `is timestamp` check fails for an absent field as well as a wrong-typed one, so together they pin the shape exactly. Sizes are re-asserted there even though [`SubmitFeedbackSchema`](../src/lib/api/feedback-schema.ts) already checked them — that is the point of a second gate. Rules count characters where Zod counts UTF-16 units, and a code point is never more than one unit, so the rule ceilings can never reject something the schema accepted.

### Read access

`read` is `superadmin`-only. Note that the **Firebase console bypasses security rules entirely** — it authenticates through Google Cloud project permissions — so reviewing submissions at launch needs no application account with `role: superadmin`. The read rule exists for the deferred admin screen.

### One submission per minute

Enforced in the route, not in the rules. [`readFeedbackThrottle`](../src/lib/firebase/server-feedback.ts) reads `users/{uid}/feedbackMeta/latest` once; that same read answers the throttle question and supplies the `count` the subsequent stamp increments, so the guard costs one read rather than two.

**Route-level is sufficient here** because the Firebase ID token never reaches the browser — it lives inside the encrypted, HTTP-only iron-session cookie — so there is no client-reachable path to Firestore that skips this endpoint. The worst outcome of a bug in this layer is spam inside a private collection, not a crossed trust boundary. A rules-level version was considered and rejected: it cannot distinguish "throttled" from "rules not deployed", because a normal user cannot read the collection to tell the difference.

**Ordering matters.** The stamp happens *after* the record is stored, and its failure is deliberately swallowed and logged:

- Stamping first would lock a user out for a minute on a write that then failed, losing the message they had typed.
- Failing the request on a stamp error would tell the user their message was lost when it is already saved. An unstamped window leaves that one account briefly un-throttled — the lesser problem by a wide margin.

`feedbackMeta` is its own document rather than two more fields on `users/{uid}` because that profile document's shape is what the `create`/`update` rules for `users/{uid}` assert against (`role`, `email`, `displayName`); widening it for an unrelated concern means editing those rules for no gain. Its rules grant `read`, `create` and `update` to the owner and no `delete` — nothing needs to remove it, and a user who could would be clearing their own rate limit.

### `429`, not `400`

A throttled submission is a real refusal the user needs to understand, so it gets its own status and a message saying to wait a moment rather than being folded into a generic validation error.

### Rules must be deployed

```bash
firebase deploy --only firestore:rules
```

Until that runs, every submission is refused with `PERMISSION_DENIED` and surfaces as a `500`. This fails closed, which is the safe direction — but it means the feature looks broken rather than being silently insecure, so it is on the pre-launch checklist twice.

### Not captured

Only the current route (`path`) is stored alongside the message. User agent, viewport, app version, screenshots and session replay are all deliberately out: `path` earns its place because a report like "the export is broken" is unactionable without knowing which screen it came from, while the rest is speculative and increases what we store about users. See the deferred list in the plan.

`type` has two values — `"feedback"` and `"problem"`. The screens this was modelled on offered "Idea", "Problem" and "Other"; "Other" is a bucket nobody triages, and "Idea" discourages the neutral or positive note that is often the most useful thing a user sends. Adding a third value means changing [`feedbackTypes`](../src/types/feedback.ts) **and** the rules, which assert the set independently.

See [`server-feedback.ts`](../src/lib/firebase/server-feedback.ts), [`route.ts`](../src/app/api/feedback/route.ts), the schema in [`feedback-schema.ts`](../src/lib/api/feedback-schema.ts), and the shared types in [`feedback.ts`](../src/types/feedback.ts).
