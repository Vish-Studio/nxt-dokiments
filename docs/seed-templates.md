# Seeding the Template Catalog

`scripts/seed-templates.ts` is a one-time (or run-whenever-you-want) script that writes the
app's marketplace catalog — 4 styles × 14 document types, 56 templates total — into Firestore's
`templates` and `templateStyles` collections. It replaces what used to be a hardcoded array
compiled into the JS bundle (`src/lib/market-place/documents.ts` × `styles.ts`) with real
Firestore documents that `GET /api/templates` reads from.

See [`docs/api-templates-documents.md`](./api-templates-documents.md) for how those two
collections fit into the overall API design.

## Why this script exists

Before this script, the only way to change the catalog was to edit code and redeploy. This
script seeds the *initial* catalog so `/api/templates` has real data to serve — it is not the
long-term way to manage templates. That's the planned admin CRUD phase (not yet built); until
then, editing the catalog means re-running this script or editing documents directly in the
Firebase console.

## How it authenticates

Firestore access in this app never uses a service-account/Admin SDK credential — every request,
including this script's, is authenticated as a real Firebase user via the Identity Toolkit REST
API, and authorized by [`firestore.rules`](../firestore.rules) exactly like every other write in
this codebase.

Specifically: `templates` and `templateStyles` grant write access only to a signed-in user whose
Firestore profile document (`users/{uid}`) has `role: "superadmin"`:

```
match /templates/{templateId} {
  allow read: if signedIn();
  allow write: if isSuperadmin();
}
```

So before running this script, you need **a real Firebase Auth account with `role: "superadmin"`
set on its Firestore profile document**. There's no admin UI yet to set that — do it by hand in
the Firebase console:

1. Firebase Console → Authentication → create a user (or use an existing one) with an email/password.
2. Firebase Console → Firestore Database → `users` collection → find that user's document (its ID
   is the Auth UID) → edit the `role` field to `superadmin`. If the document doesn't exist yet,
   sign in as that user once through the app first (`POST /api/auth/sign-in`) — this app creates
   the profile document automatically on first sign-in, defaulted to `role: "free"` — then edit
   the field afterwards.

The `DEV_AUTH_BYPASS` dev shortcut does **not** help here — its fake session has `role: "special"`,
which `isSuperadmin()` rejects. This script only works against a real Firebase account.

## Why it's compiled before running

This project has no `ts-node`/`tsx`, and the Node version available in most dev environments here
predates `--experimental-strip-types`. So `scripts/seed-templates.ts` is plain TypeScript that
gets compiled to JavaScript with `tsc` first, then run with plain `node` — it is **not** meant to
be run directly with `node scripts/seed-templates.ts`.

[`tsconfig.seed.json`](../tsconfig.seed.json) is a scratch config scoped to just this script and
the catalog data files it imports (`documents.ts`, `styles.ts`, and the `template`/`auth` types).
It compiles as ES modules (not CommonJS) into a gitignored `.scratch-seed/` directory — this
matters because `@phosphor-icons/react`'s CommonJS build breaks under `require()` in this Node
version, and `documents.ts` used to import icons unnecessarily; that import was moved to its own
file ([`document-icons.ts`](../src/lib/market-place/document-icons.ts)) precisely so this script
doesn't need any React/icon dependency to run.

The `npm run seed:templates` script wires the two steps together:

```json
"seed:templates": "tsc -p tsconfig.seed.json && node .scratch-seed/scripts/seed-templates.js"
```

## Required environment variables

| Variable | Where it comes from | Notes |
|---|---|---|
| `FIREBASE_API_KEY` | Firebase project settings | Same value already in `.env.local` |
| `FIREBASE_PROJECT_ID` | Firebase project settings | Same value already in `.env.local` |
| `SEED_ADMIN_EMAIL` | The superadmin account you set up above | Not in `.env.local` by default — add it |
| `SEED_ADMIN_PASSWORD` | Same account's password | Not in `.env.local` by default — add it |

The script fails fast with a clear `Missing required environment variable: X` error if any of
these are absent — it will not partially run.

## Running it

Add `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` to your `.env.local` alongside the existing
Firebase vars, then run the compile and run steps explicitly so you can pass `--env-file` to the
second one (npm doesn't forward flags like that through a chained script):

```bash
npx tsc -p tsconfig.seed.json
node --env-file=.env.local .scratch-seed/scripts/seed-templates.js
```

`--env-file` is a native Node flag (Node 20.6+) that loads `.env.local` into `process.env` for
that one command — no extra dependency needed, and it correctly ignores comment lines and handles
quoted values the same way `.env.local` already writes them.

### What you'll see on success

```
Signing in as admin@example.com...
Seeding templateStyles...
  templateStyles/classic
  templateStyles/modern
  templateStyles/brutalist
  templateStyles/minimalist
Seeding templates...
  templates/classic-contract
  templates/classic-proposal
  ...
  templates/minimalist-purchase-order
Done. Seeded 4 styles and 56 templates.
```

## What it writes

**`templateStyles/{styleId}`** — one document per style (`classic`, `modern`, `brutalist`,
`minimalist`), fields: `name`, `description`, `tier`, `sortOrder`, `isActive: true`.

**`templates/{templateId}`** — one document per style × document-type combination, using the
same ID scheme the app has always used for saved-template references (`{styleId}-{documentType}`,
e.g. `classic-contract`, `modern-invoice`). Fields: `name`, `description`, `documentType`,
`styleId` (a plain string reference, resolved by `server-catalog.ts` when serving `/api/templates`),
`tier`, `fields` (the array of form-field definitions used by the document editor), `sortOrder`,
`isActive: true`.

Both `isActive` flags exist so a template or style can be hidden from `/api/templates` without
deleting it — `listActiveTemplates()`/`getTemplateById()` in `server-catalog.ts` filter on this.

## Re-running is safe

Every write is a Firestore `PATCH` (upsert) against a deterministic document ID — running the
script again just overwrites the same 60 documents with the same data. It never creates
duplicates, and it never touches anything outside `templates`/`templateStyles` (in particular, it
never touches any user's `savedTemplates` or `documents`).

## Where it writes to

There is no Firestore emulator wired up in this project — this script talks to your **real**
Firebase project's Firestore, using whatever `FIREBASE_PROJECT_ID` resolves to. If you want to
avoid seeding test data into a production project, point `FIREBASE_PROJECT_ID`/`FIREBASE_API_KEY`
at a separate Firebase project (or emulator, if one gets set up later) before running this.
