# Document sharing — data model

Foundation for sharing a document with another person for signature (epic:
document sharing & e-sign). Nothing here is user-visible yet; everything is
behind `NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED` (see below).

## Feature flag

`NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED=true` turns sharing on. Anything else —
including unset — leaves it off. It is `NEXT_PUBLIC_` so server routes and client
components read one constant (`documentSharingEnabled`,
`src/lib/sharing/feature-flag.ts`); like `NEXT_PUBLIC_DISABLE_TIER_LOCKS` it is
inlined at build time, so changing it needs a rebuild and redeploy. Sharing routes
call `assertDocumentSharingEnabled()` first and answer `404` while it is off.

## Collections

### `sharedDocuments/{docId}`

Top-level, because two parties read the same record. The owner's original in
`users/{uid}/documents` is not modified; a share is a snapshot copy.

| Field | Type | Notes |
|---|---|---|
| `ownerId`, `ownerName`, `ownerEmail` | string | Immutable `ownerId`. |
| `name`, `templateId`, `values`, `templateSnapshot?` | | Copied from the source document. |
| `sourceDocumentId` | string | The document the share was made from. |
| `recipients` | array of map | `{ email, invitedAt, status, signedAt?, uid? }`. Informational; the API is its only writer. |
| `recipientEmails` | string[] | Normalised addresses. **Derived from `recipients`** — security rules cannot look inside an array of maps. |
| `recipientUids` | string[] | Linked accounts. Derived from `recipients`. |
| `signatures` | map | Keyed by signer uid → `{ email, signedAt, type: "typed", value }`. |
| `locked` | bool | Once true, nobody can write or delete. |
| `createdAt`, `updatedAt` | timestamp | |

A recipient's `signed` status is derived from `signatures`, not stored by them:
rules only let a recipient write `signatures`, `locked` and `updatedAt`, so they
cannot alter `recipients`. `parseSharedDocument` applies that derivation.

### `users/{uid}/shareRecipients/{normalisedEmail}` — sharing ledger

One entry per distinct person the account has ever shared with:
`{ email, firstSharedAt, lastSharedAt }`. A recipient limit counts these. Entries
are create/update only — never deleted — so removing a share cannot hand a place
back. This is also why the ledger exists from day one, ahead of any limit: when a
limit is switched on, existing usage is already known.

## Access rules (`firestore.rules`)

| Actor | May |
|---|---|
| Owner | Read. Create (unlocked, no signatures). Edit and delete while unlocked. Never write `signatures` or `locked`; cannot change `ownerId`. |
| Recipient | Read. Add exactly one signature — their own uid key — while unlocked. Nothing else. |
| Anyone, once `locked` | Read only (owner and recipients). No update, no delete. |
| Anyone else | Nothing. |

A recipient is matched by uid in `recipientUids`, or by an address in
`recipientEmails` that Firebase reports as **verified**. An unverified address is
never enough: anyone could register under an address a document was shared with.
Password sign-ups are sent a verification email automatically and the dashboard
nudges unverified users to confirm it — see
[`firebase-auth.md`](./firebase-auth.md#email-verification). A signature must
carry the signer's own token address, so nobody can sign as someone else.

**Open point for the invite story:** with no admin SDK, the server cannot look up
a uid from an email, and cannot write another user's profile. Linking a
password-registered recipient with an unverified address therefore needs a proof
of address ownership (the emailed invite token) and a rule that accepts it.

## Share policy

All sharing decisions go through `canShareWith` in `src/lib/sharing/policy.ts`.

```ts
export const SHARE_RECIPIENT_LIMIT = { free: null, silver: null, gold: null, special: null, superadmin: null };
```

`null` is unlimited, and nothing is capped today. To cap a plan, set its value
(for example `free: 2`); `canShareWith` then returns
`{ allowed: false, reason: "SHARE_LIMIT_REACHED" }` for a new person beyond it.
Re-sharing with someone already in the ledger never counts. The limit is enforced
in the server route only, not in the rules, so changing it needs no rules deploy.

## Error codes

`SHARE_LIMIT_REACHED` (403), `SHARE_SELF_NOT_ALLOWED` (400), `DOCUMENT_LOCKED` (409),
`NOT_A_RECIPIENT` (404), `SHARE_ALREADY_WITH_ANOTHER` (409) — statuses and user-safe messages in
`src/lib/sharing/server-guard.ts`.

## Share API

`POST /api/documents/:id/share`, `GET /api/documents/shared` and
`GET /api/documents/shared/:id` — see
[`api-templates-documents.md`](./api-templates-documents.md#sharing-a-document).

- One shared document per source document (`{ownerUid}_{sourceDocumentId}`), so
  re-sharing is idempotent and refreshes the copy while it is unlocked.
- A document has **one recipient** for now: sharing it with a second, different
  address is a `409 SHARE_ALREADY_WITH_ANOTHER`. Lift this when multiple
  recipients are built.
- The shared document and the ledger entry are committed atomically.
- No account lookup: recipients are matched by verified address, so `uid` stays
  unset until the invite story links accounts. An unverified recipient is not
  detectable at share time — they simply see nothing until they verify.
- Reads of an absent or foreign document are refused by the rules (403), which
  the API reports as `404` so existence is not leaked. The list query matches
  `recipientEmails` on the token's address; for an unverified account the rules
  refuse it and the API returns an empty list.

## Share dialog (UI)

`ShareDialog` (`components/dashboard/share-dialog`) shares a document by email.
It is reachable from the three-dot menu on each My Documents row and from a
**Share** button in the document editor (saved documents only), and both are
hidden while `NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED` is off.

- The address is validated with `shareEmailSchema` (`lib/sharing/email-schema.ts`),
  the same schema the route uses, so the dialog and the API agree.
- Suggestions (`ShareRecipientSuggestions`, at most 5, each address shown once) come
  from three sections in order: the document's own `toEmail` value (also pre-filled
  when the dialog opens), the user's saved clients' emails, and
  `GET /api/documents/share-recipients` (the owner's ledger, newest first).
- A `403` (plan limit) opens `UpgradeDialog` with the `share_limit` reason. Every
  other error is shown inline and keeps the typed address.
- Sharing from the editor shares the **saved** document, not unsaved edits.
- A document that is already shared shows the API's `409` message; showing the
  current recipient and status is left to DS-4/DS-6.

## Monthly document quota

The app currently has no monthly document quota (the plan list says "Create
unlimited documents"). Shared documents live in their own collection, apart from
`users/{uid}/documents`, so a recipient's own document count is unaffected by
anything shared with them — if a quota is added later it will not see them.

## Testing

- `npm run test:rules` — Firestore rules tests in `tests/firestore-rules/`, run
  against the emulator (needs Java). Kept out of the default `vitest run` because of that requirement.
- `npx vitest run --project node` — policy and serialisation unit tests.

Deploy rules with `firebase deploy --only firestore:rules` (use the `nonprod`
project first, per `.env.example`).
