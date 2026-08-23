# API Reference — Templates, Saved Templates, Documents, Clients

Documents the shape of four route groups:

- `/api/templates` — read-only marketplace catalog, served from Firestore.
- `/api/saved-templates` — per-user library of templates a user has added from the marketplace.
- `/api/documents` — per-user documents created from a saved template.
- `/api/clients` — per-user client book: the contact details a user reuses when preparing documents.

A saved template references a template; a document references a saved template's data. `clients` is independent of the other three.

## Firestore shape backing these routes

```
templates/{templateId}                     — admin-managed catalog entry, seeded from static data
templateStyles/{styleId}                   — admin-managed style catalog, seeded from static data
users/{uid}/savedTemplates/{templateId}    — join record; doc ID = templateId (idempotent save)
users/{uid}/documents/{docId}              — user-created document, snapshots template fields at creation
users/{uid}/clients/{clientId}             — user's own client contact details; doc ID server-generated
```

`templates`/`templateStyles` are seeded from the static arrays in `src/lib/market-place/` with matching IDs (e.g. `classic-contract`) and are read-only from the app's perspective — there are no admin write routes for them.

---

## `/api/templates`

Public marketplace catalog. Replaces the static `marketplaceTemplates` array computed in [`src/lib/market-place/index.ts`](../src/lib/market-place/index.ts). No user-specific data — safe to cache.

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `GET` | `/api/templates` | List the full active template catalog (all styles × all document types) plus the active style list, for the Marketplace browser. | Session required (`401` if absent). Tier gating happens client-side against the user's role for UX, and again server-side wherever a template is actually saved. | Optional query params: `styleId` (filter `templates` by style), `tier` (filter `templates` by tier). `styles` is always the full active list, unfiltered. | `200 { templates: MarketplaceTemplate[], styles: TemplateStyle[] }`, both sorted by the seeded `sortOrder` field so the Marketplace tab bar renders Classic → Modern → Brutalist → Minimalist rather than Firestore's arbitrary read order. | `GET` because this is a pure read with no side effects and is cacheable (short `revalidate` window). `styles` is returned alongside `templates` in one response, not as a separate route, because the Marketplace screen always needs both together (the tab bar and the templates within the active tab). |
| `GET` | `/api/templates/:id` | Fetch a single template's full definition (used when hydrating a saved template or a document's template reference, and for direct-link previews). | Session required. | — | `200 { template: MarketplaceTemplate }` / `404` if not found or inactive. | Split from the list route so `saved-templates` and `documents` can resolve one template by ID without pulling the entire catalog over the wire. |

`POST`/`PATCH`/`DELETE` are not available on this route group — the catalog is seeded directly (script or Firestore console) and is read-only from the app's perspective until an admin CRUD surface exists.

See [`server-catalog.ts`](../src/lib/firebase/server-catalog.ts) (`listActiveTemplates`, `listActiveStyles`, `getTemplateById`), [`route.ts`](../src/app/api/templates/route.ts), [`[id]/route.ts`](../src/app/api/templates/[id]/route.ts). Seeded via [`scripts/seed-templates.ts`](../scripts/seed-templates.ts) — see [`docs/seed-templates.md`](./seed-templates.md). Consumed client-side via [`useTemplatesQuery`](../src/hooks/queries/use-templates.ts) in `MarketplaceBrowser`.

---

## `/api/saved-templates`

The user's personal library — templates they've added from the Marketplace, shown under **My Templates**. Each save/remove is a single-document write against a subcollection rather than an overwrite of a `savedTemplates` array field.

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `GET` | `/api/saved-templates` | List the signed-in user's saved templates, hydrated with full template data (name, fields, style) so My Templates and the document picker don't need a second round trip. | Session required (`401` if absent). | — | `200 { savedTemplates: Array<{ templateId, savedAt, template: MarketplaceTemplate }> }` — a saved reference whose template no longer exists/is inactive is silently excluded, not surfaced as an error. | `GET` — read with no side effects. Hydration (vs. returning bare IDs) trades one extra server-side batched Firestore read for eliminating a client-side join and a second network round trip, matching what `MyTemplatesView` and `DocumentsView` need directly. |
| `POST` | `/api/saved-templates` | Save one template to the user's library. | Session required. | `{ templateId: string }` | `201 { templateId, savedAt }` on a new save; `200` with the same body if already saved (idempotent, not an error). `403` if the template's tier isn't unlocked by the user's role, or the free-tier save limit is reached. `404` if the template doesn't exist or is inactive. | `POST` on the collection to create one join record. The write is a single-document `PATCH` with doc ID = `templateId` (effectively an upsert) — idempotent, no race with a concurrent save/remove in another tab. The tier/limit check (`canUseTier`, free-tier cap) is re-validated server-side, not trusted from the client. |
| `DELETE` | `/api/saved-templates/:templateId` | Remove one template from the user's library. | Session required. | — | `204` on success, including when the template wasn't saved (idempotent delete, not a `404`). | `DELETE` on the specific resource path — removes exactly one document, no read-modify-write cycle, no risk of clobbering a save that happened in another tab a moment earlier. |

**Why not `PATCH` or `PUT`:** a saved-template record has no mutable fields of its own (it's a pure join: `templateId` + `savedAt`) — there's nothing to update in place, only create or remove.

`DELETE` returns `204` unconditionally, even when the template wasn't saved, matching the idempotent-delete semantics used by `removeSavedTemplate`'s underlying `deleteFirestoreDocument`, and avoiding a wasted existence-check read before every delete.

See [`server-saved-templates.ts`](../src/lib/firebase/server-saved-templates.ts), [`route.ts`](../src/app/api/saved-templates/route.ts), [`[templateId]/route.ts`](../src/app/api/saved-templates/[templateId]/route.ts).

---

## `/api/documents`

User-created documents — filled-in instances of a saved template, stored in Firestore under `users/{uid}/documents/{docId}`.

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `GET` | `/api/documents` | List all of the signed-in user's documents (for the Documents list view). | Session required. | Optional `templateId` filter. | `200 { documents: UserDocument[] }` | `GET` — straightforward list read, scoped to the caller's own subcollection so no `uid` needs to be passed. |
| `GET` | `/api/documents/:id` | Fetch one document (used when opening the editor or the preview/export dialog on a full page load rather than from already-loaded list state). | Session required; must own the document. | — | `200 { document: UserDocument }` / `404`. | Separate single-item read so the editor doesn't depend on the list already being in memory — supports direct links/refreshes. |
| `POST` | `/api/documents` | Create a new document from a saved template. | Session required. | `{ name, templateId, values }` — `values` capped at 50 keys, 20,000 chars each (see below). | `201 { document: UserDocument }` / `400` on a malformed or oversized body / `404` if `templateId` doesn't resolve to an active template. | `POST` to create a new resource with a server-generated ID. At creation time the server snapshots the template's current `name`, `style`, and `fields` onto the document (`templateSnapshot`) rather than storing only a live `templateId` reference — so a later template edit or deletion in the admin catalog can't retroactively change or break a document a user already finished and possibly exported/signed. `templateId` is still stored for "recreate from this template" convenience, but rendering always uses the snapshot. |
| `PATCH` | `/api/documents/:id` | Update a document's `name` and/or `values` (editing an existing document). | Session required; must own the document. | `{ name?, values? }` — partial, at least one required. | `200 { document: UserDocument }` / `400` if the body is empty/malformed/oversized / `404` if not found or not owned. | `PATCH` rather than `PUT` because updates are partial (the editor only sends changed fields) and the `templateSnapshot` is immutable after creation — this route never touches it. |
| `DELETE` | `/api/documents/:id` | Delete a document. | Session required; must own the document. | — | `204` on success, including when the document wasn't found (idempotent delete, matching the same choice made for `saved-templates`). | Standard resource deletion, single-document write. |

**Why a subcollection (`users/{uid}/documents/{docId}`) instead of a `documents` array field or a top-level collection:** each document can be edited independently without a read-modify-write of every other document, avoids the 1 MiB per-document Firestore size ceiling as a user accumulates documents, and keeps ownership checks trivial (`request.auth.uid` must equal the parent path segment) without needing a `uid` field + composite index the way a top-level collection would.

**`TemplateSnapshot` shape** — `{ description: string, documentType: DocumentType, fields: TemplateField[], name: string, style: TemplateStyle }`, stored on `UserDocument` as an optional `templateSnapshot` field so `TemplatePreviewDialog`/`DocumentExportDialog` can render a document without ever falling back to a live catalog lookup — see `snapshotToMarketplaceTemplate` in `src/types/template.ts`. The field stays optional because a handful of pre-migration fixtures predate it; every document created through this API always has one.

**`values` size bounds** — capped at 50 keys and 20,000 characters per value in the Zod schema, enforced before the request ever reaches Firestore. This is a deliberately generous ceiling (the largest template today has ~13 fields) meant to stop an oversized payload — e.g. via a direct Postman request — from writing a document that risks Firestore's 1 MiB per-document limit, not to constrain legitimate use.

See [`server-documents.ts`](../src/lib/firebase/server-documents.ts), [`route.ts`](../src/app/api/documents/route.ts), [`[id]/route.ts`](../src/app/api/documents/[id]/route.ts), and [`use-documents.ts`](../src/hooks/queries/use-documents.ts) (the TanStack Query hooks `DocumentsView`/`DashboardView` consume).

---

## `/api/clients`

The user's own client book — the contact details they reuse when preparing documents, shown under **My Clients**, stored under `users/{uid}/clients/{clientId}`.

**Clients carry no tier or entitlement meaning.** They are private reference data, not a purchasable resource — so unlike `saved-templates` there is no `canUseTier` gate and no count limit on this collection, on any plan. The only authorisation question these routes ask is whether the caller owns the parent path.

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `GET` | `/api/clients` | List the signed-in user's clients for the My Clients list and the Dashboard snapshot tile. | Session required (`401` if absent). | — | `200 { clients: Client[] }`, sorted newest-first. | `GET` — plain list read, scoped to the caller's own subcollection so no `uid` is passed. Sorted server-side so no consumer has to re-sort. |
| `POST` | `/api/clients` | Add one client. | Session required. | `{ name, companyName, email, phone, address?, brn?, nationalId? }` | `201 { client: Client }` / `400` on a malformed body. | `POST` to create a new resource with a server-generated ID. Not idempotent, and deliberately so — there's no natural key to upsert on (see below), and adding two contacts at the same company is legitimate. |
| `PATCH` | `/api/clients/:clientId` | Edit a client's details. | Session required; must own the client. | Any subset of the create fields; at least one required. | `200 { client: Client }` / `400` if the body is empty or malformed / `404` if not found or not owned. | `PATCH` rather than `PUT` because edits are partial — correcting a phone number shouldn't require resending every field. Editing matters specifically because of the prefill use case: a client with a stale number would otherwise have to be deleted and re-added for future documents to fill correctly. |
| `DELETE` | `/api/clients/:clientId` | Remove a client. | Session required; must own the client. | — | `204` on success, including when the client wasn't found (idempotent delete, matching `saved-templates` and `documents`). | Standard resource deletion, single-document write. Safe with no cascade — see below. |

**Why a server-generated doc ID, unlike `savedTemplates`:** a saved template's doc ID *is* its `templateId`, which buys a free idempotent upsert. A client has no equivalent natural key — `email` is the only candidate and it's both optional and mutable, so keying on it would turn an email correction into a delete-and-recreate, and would collide for two contacts reachable at one shared address. IDs are minted server-side as `client_{base36 time}_{random}`, the same scheme `documents` uses.

**Deleting a client never affects existing documents.** The editor copies a client's details into the document's own `values` at fill time rather than storing a live `clientId` reference. This follows the same reasoning as `templateSnapshot`: a finished — possibly exported or signed — document must not silently change because the client moved office months later. The useful consequence is that client deletion needs no cascade and can't orphan or corrupt a document.

**`updateClient` reads before writing.** Firestore's REST `PATCH` is an upsert, so a masked write aimed at a `clientId` that never existed would silently *create* a partial client record. `updateClient` fetches the document first and returns `null` (surfaced as `404`) when it's absent. Having the pre-write state in hand also lets the response be composed locally, so the guard costs one read rather than a read plus a re-read.

**`Client` fields.** `address`, `brn`, `companyName`, `email`, `name`, `nationalId`, `phone` — plus server-assigned `id`, `createdAt`, `updatedAt`. `address`, `brn`, and `nationalId` are optional and stored as `""` rather than omitted, so every stored client has one consistent shape.

**Why not `PUT`:** the client form submits every field, so a whole-resource replace would work, but the API is also the surface an inline edit (fix one phone number) uses, and `PATCH` serves both without a second route.

See [`server-clients.ts`](../src/lib/firebase/server-clients.ts), [`route.ts`](../src/app/api/clients/route.ts), [`[clientId]/route.ts`](../src/app/api/clients/[clientId]/route.ts), the shared Zod schemas in [`client-schema.ts`](../src/lib/api/client-schema.ts), and [`use-clients.ts`](../src/hooks/queries/use-clients.ts) (the hooks `MyClientsView` and `DashboardView` consume).

### Prefilling documents from a client

Storing clients only pays off if picking one fills a document in. [`prefill.ts`](../src/lib/market-place/prefill.ts) maps a client (and the user's own profile) onto a template's field values; [`ClientPicker`](../src/components/dashboard/client-picker/client-picker.tsx) is the control in the editor, rendered above `TemplateForm` in [`documents-view.tsx`](../src/components/dashboard/documents-view/documents-view.tsx).

**Field keys are not uniform across document types**, so prefill resolves against the keys each template actually declares rather than assuming `toName` exists. Each rule lists candidates in priority order and the first match wins:

| Source | Candidate template keys | Notes |
|---|---|---|
| `companyName \|\| name` | `toName`, `partyTwo` | Company wins — documents address the business entity; the contact name is the fallback for clients stored without one. |
| `address` | `toAddress`, `partyTwoAddress` | |
| `email` | `toEmail` | Billing types only. |
| `phone` | `toPhone` | Billing types only. |
| `brn` | `toBrn` | Billing types only. |
| user's `companyName \|\| fullName \|\| displayName` | `fromName`, `partyOne` | Sender side, applied automatically on a new document. |
| user's `address` | `fromAddress`, `partyOneAddress` | |

The `partyOne`/`partyTwo` aliases make an NDA work without a special case — the user lands in "Disclosing party", the client in "Receiving party". `meeting-minutes-action-brief` declares no counterparty key at all, so `supportsClientPrefill` returns `false` and the picker doesn't render.

**Recipient contact fields are billing-only.** `toEmail`/`toPhone`/`toBrn` come from `recipientContactFields` in [`documents.ts`](../src/lib/market-place/documents.ts), spread into `invoice`, `quotation`, `receipt` and `purchase-order` only — deliberately *not* into the shared `fromToFields`, which would have made a letter of intent ask for a business registration number. On the other eight recipient-bearing types those rules simply find no matching key and are skipped. 16 of the 56 template documents changed shape, so this **required a re-seed** (`npm run seed:templates`; see [`docs/seed-templates.md`](./seed-templates.md)).

**Empty values are never written.** Prefilling from a client with no BRN leaves a BRN the user already typed intact, rather than blanking it. Selecting a client merges over the current draft and overwrites only the mapped keys; there is deliberately no "unfill".

**Sender prefill applies only to new documents.** `startNewDocument` seeds the draft from the profile; `openDocument` must never do so or it would overwrite saved values. The deep-linked path (`/documents?template=…` from the marketplace) waits for `useAuthStore`'s `status` to leave `"loading"` before starting, because that session fetch otherwise races the saved-templates fetch and would hand `startNewDocument` a null user.

**Documents created before the re-seed are unaffected** — they render from their own `templateSnapshot`, so an invoice saved earlier still shows the original two-field recipient block. That is the snapshot design working as intended.

**Not stored:** which client a document was filled from. Values are copied, not referenced, so `UserDocument`, its Firestore rules and its parse/serialise layer are untouched.

**Known asymmetry:** billing documents carry the recipient's email/phone/BRN but not the sender's — there are no `fromEmail`/`fromPhone`/`fromBrn` fields. Arguably wrong for a real invoice; left as a follow-up rather than expanded unilaterally.

---

## Cross-cutting notes

- **Auth pattern**: every session-gated route uses the shared [`withSession`](../src/lib/api/with-session.ts) wrapper — resolves the session, 401s if `!session.user`, calls a `server-*.ts` Firestore helper with `session.idToken`, and catches anything thrown via [`handleApiError`](../src/lib/api/errors.ts) so routes don't need their own `try`/`catch`.
- **Ownership enforcement**: for `saved-templates`, `documents` and `clients`, the `uid` in the Firestore path always comes from the session, never from the request body/URL — a user can never act on another user's subcollection regardless of what ID they pass.
- **Server-side tier re-validation**: `POST /api/saved-templates` re-checks `canUseTier` and the free-tier save limit server-side, not trusted from the client. `MarketplaceBrowser` still checks both client-side first, purely for UX (avoiding a round trip to show an error the server would reject anyway).
- **Public-launch override**: `canUseTier` short-circuits to always-true when `NEXT_PUBLIC_DISABLE_TIER_LOCKS=true` (see [`src/lib/market-place/index.ts`](../src/lib/market-place/index.ts)) — any signed-in user may save/use any tier of template. The free-tier save limit is unaffected by this flag and is still enforced normally. See that file for the current flag state and behavior.
- **`/api/templates` naming**: this route is the read-only catalog. Saved-template CRUD lives at `/api/saved-templates`.
- **Request validation**: every route validates its input with a Zod schema via [`parseBody`/`parseQuery`](../src/lib/api/validate.ts) before touching Firestore — a malformed body (wrong types, missing fields) is rejected with `400` rather than reaching the Firestore layer.
