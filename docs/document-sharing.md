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
never enough: this app does not verify email at sign-up, so anyone could register
under an address a document was shared with. A signature must carry the signer's
own token address, so nobody can sign as someone else.

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
`NOT_A_RECIPIENT` (404) — statuses and user-safe messages in
`src/lib/sharing/server-guard.ts`.

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
