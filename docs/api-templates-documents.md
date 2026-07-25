# API Plan — Templates, Saved Templates, Documents

Documents the shape of three route groups, all now implemented (see the "Status: implemented" note under each section for what to read for the actual code):

- `/api/templates` — read-only marketplace catalog, served from Firestore instead of the static bundle in `src/lib/market-place/`.
- `/api/saved-templates` — per-user library of templates a user has added from the marketplace (replaced the old `/api/templates` route and the `savedTemplates` array field on `users/{uid}`).
- `/api/documents` — per-user documents created from a saved template (replaces the localStorage-only `documents-store.ts` at the API layer; the frontend itself is not yet wired to it — see that section for details).

Build order was `templates` → `saved-templates` → `documents`, since each depended on the one before it (a saved template references a template; a document references a saved template's data).

## Firestore shape backing these routes

```
templates/{templateId}                     — admin-managed catalog entry (seeded from static data)
templateStyles/{styleId}                   — admin-managed style catalog (seeded from static data)
users/{uid}/savedTemplates/{templateId}    — join record; doc ID = templateId (idempotent save)
users/{uid}/documents/{docId}              — user-created document, snapshots template fields at creation
```

No admin write routes are included in this pass — `templates`/`templateStyles` are seeded once from the existing static arrays with matching IDs (e.g. `classic-contract`) and are read-only from the app's perspective until the admin CRUD phase.

---

## `/api/templates`

Public marketplace catalog. Replaces the static `marketplaceTemplates` array computed in [`src/lib/market-place/index.ts`](../src/lib/market-place/index.ts). No user-specific data — safe to cache.

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `GET` | `/api/templates` | List the full active template catalog (all styles × all document types) for the Marketplace browser. | Session required (`401` if absent) — decided against public access; see the discussion in this doc's history. Tier gating still happens client-side against the user's role for UX, and again server-side wherever a template is actually saved. | Optional query params: `styleId` (filter by style), `tier` (filter by tier). | `200 { templates: MarketplaceTemplate[] }` | `GET` because this is a pure read with no side effects and is cacheable (short `revalidate` window) — matches how the client currently just imports a static array. |
| `GET` | `/api/templates/:id` | Fetch a single template's full definition (used when hydrating a saved template or a document's template reference, and for direct-link previews). | Session required. | — | `200 { template: MarketplaceTemplate }` / `404` if not found or inactive. | Split from the list route so `saved-templates` and `documents` can resolve one template by ID without pulling the entire catalog over the wire. |

**Status: implemented** — see [`server-catalog.ts`](../src/lib/firebase/server-catalog.ts), [`route.ts`](../src/app/api/templates/route.ts), [`[id]/route.ts`](../src/app/api/templates/[id]/route.ts). Seeded via [`scripts/seed-templates.ts`](../scripts/seed-templates.ts) — see [`docs/seed-templates.md`](./seed-templates.md).

**Not included in this pass:** `POST`/`PATCH`/`DELETE` — those belong to the admin CRUD phase once the freeform-vs-fixed-taxonomy decision is made. Until then, the catalog is seeded directly (script or Firestore console) and this route group is read-only.

---

## `/api/saved-templates`

The user's personal library — templates they've added from the Marketplace, shown under **My Templates**. Replaces today's `/api/templates` route (which is misnamed relative to its actual job) and the `savedTemplates` array field on `users/{uid}`, migrating to a subcollection so each save/remove is a single-document write instead of a whole-array overwrite.

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `GET` | `/api/saved-templates` | List the signed-in user's saved templates, hydrated with full template data (name, fields, style) so My Templates and the document picker don't need a second round trip. | Session required (`401` if absent). | — | `200 { savedTemplates: Array<{ templateId, savedAt, template: MarketplaceTemplate }> }` — a saved reference whose template no longer exists/is inactive is silently excluded, not surfaced as an error. | `GET` — read with no side effects. Hydration (vs. returning bare IDs) trades one extra server-side batched Firestore read for eliminating a client-side join and a second network round trip, matching what `MyTemplatesView` and `DocumentsView` need directly. |
| `POST` | `/api/saved-templates` | Save one template to the user's library. | Session required. | `{ templateId: string }` | `201 { templateId, savedAt }` on a new save; `200` with the same body if already saved (idempotent, not an error). `403` if the template's tier isn't unlocked by the user's role, or the free-tier save limit is reached. `404` if the template doesn't exist or is inactive. | `POST` on the collection to create one join record. Chosen over reusing the old "send the whole array" `POST` because each save is now a single-document write (`PATCH` with doc ID = `templateId`, effectively an upsert) — idempotent, no race with a concurrent save/remove in another tab. Server re-validates the tier/limit check (`canUseTier`, free-tier cap) that before this pass only ran client-side — this closes that gap. |
| `DELETE` | `/api/saved-templates/:templateId` | Remove one template from the user's library. | Session required. | — | `204` on success, including when the template wasn't saved (idempotent delete, not a `404`). | `DELETE` on the specific resource path, not a `POST` with a mutated array — removes exactly one document, no read-modify-write cycle, no risk of clobbering a save that happened in another tab a moment earlier. |

**Why not `PATCH` or `PUT`:** a saved-template record has no mutable fields of its own (it's a pure join: `templateId` + `savedAt`) — there's nothing to update in place, only create or remove.

**Status: implemented** — see [`server-saved-templates.ts`](../src/lib/firebase/server-saved-templates.ts), [`route.ts`](../src/app/api/saved-templates/route.ts), [`[templateId]/route.ts`](../src/app/api/saved-templates/[templateId]/route.ts). One deviation from the original plan: `DELETE` returns `204` unconditionally rather than `404` when the template wasn't saved — matching the idempotent-delete semantics already used by `removeSavedTemplate`'s underlying `deleteFirestoreDocument`, and avoiding a wasted existence-check read before every delete.

---

## `/api/documents`

User-created documents — filled-in instances of a saved template. Replaces the Zustand `persist`-to-`localStorage` behavior in [`documents-store.ts`](../src/stores/documents-store.ts), which is the one real data-loss risk in the app today (a user's actual business documents live only in their browser's local storage).

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `GET` | `/api/documents` | List all of the signed-in user's documents (for the Documents list view). | Session required. | Optional `templateId` filter. | `200 { documents: UserDocument[] }` | `GET` — straightforward list read, scoped to the caller's own subcollection so no `uid` needs to be passed. |
| `GET` | `/api/documents/:id` | Fetch one document (used when opening the editor or the preview/export dialog on a full page load rather than from already-loaded list state). | Session required; must own the document. | — | `200 { document: UserDocument }` / `404`. | Separate single-item read so the editor doesn't depend on the list already being in memory — supports direct links/refreshes. |
| `POST` | `/api/documents` | Create a new document from a saved template. | Session required. | `{ name, templateId, values }` — `values` capped at 50 keys, 20,000 chars each (see below). | `201 { document: UserDocument }` / `400` on a malformed or oversized body / `404` if `templateId` doesn't resolve to an active template. | `POST` to create a new resource with a server-generated ID. At creation time the server snapshots the template's current `name`, `style`, and `fields` onto the document (`templateSnapshot`) rather than storing only a live `templateId` reference — so a later template edit or deletion in the admin catalog can't retroactively change or break a document a user already finished and possibly exported/signed. `templateId` is still stored for "recreate from this template" convenience, but rendering always uses the snapshot. |
| `PATCH` | `/api/documents/:id` | Update a document's `name` and/or `values` (editing an existing document). | Session required; must own the document. | `{ name?, values? }` — partial, at least one required. | `200 { document: UserDocument }` / `400` if the body is empty/malformed/oversized / `404` if not found or not owned. | `PATCH` rather than `PUT` because updates are partial (the editor only sends changed fields, matching the existing `updateDocument(uid, id, patch)` store signature) and the `templateSnapshot` is immutable after creation — this route never touches it. |
| `DELETE` | `/api/documents/:id` | Delete a document. | Session required; must own the document. | — | `204` on success, including when the document wasn't found (idempotent delete, matching the same choice made for `saved-templates`). | Standard resource deletion, single-document write, matches the existing `removeDocument` action. |

**Why a subcollection (`users/{uid}/documents/{docId}`) instead of a `documents` array field or a top-level collection:** each document can be edited independently without a read-modify-write of every other document (unlike the old `savedTemplates` array pattern), avoids the 1 MiB per-document Firestore size ceiling as a user accumulates documents, and keeps ownership checks trivial (`request.auth.uid` must equal the parent path segment) without needing a `uid` field + composite index the way a top-level collection would.

**`TemplateSnapshot` shape** — `{ fields: TemplateField[], name: string, style: TemplateStyle }`, added to `UserDocument` as an optional `templateSnapshot` field (optional only because it predates existing localStorage-created documents from the not-yet-wired-up `documents-store.ts`; every document created through this API always has one).

**`values` size bounds** — capped at 50 keys and 20,000 characters per value in the Zod schema, enforced before the request ever reaches Firestore. This is a deliberately generous ceiling (the largest template today has ~13 fields) meant to stop a deliberately oversized payload — e.g. via a direct Postman request — from writing a document that risks Firestore's 1 MiB per-document limit, not to constrain legitimate use.

**Status: implemented** — see [`server-documents.ts`](../src/lib/firebase/server-documents.ts), [`route.ts`](../src/app/api/documents/route.ts), [`[id]/route.ts`](../src/app/api/documents/[id]/route.ts). `documents-store.ts` (the frontend Zustand store, still localStorage-only) is intentionally untouched in this pass — wiring the frontend to this API is separate follow-up work.

---

## Cross-cutting notes

- **Auth pattern**: every session-gated route uses the shared [`withSession`](../src/lib/api/with-session.ts) wrapper — resolves the session, 401s if `!session.user`, calls a `server-*.ts` Firestore helper with `session.idToken`, and catches anything thrown via [`handleApiError`](../src/lib/api/errors.ts) so routes don't need their own `try`/`catch`.
- **Ownership enforcement**: for `saved-templates` and `documents`, the `uid` in the Firestore path always comes from the session, never from the request body/URL — a user can never act on another user's subcollection regardless of what ID they pass.
- **Server-side tier re-validation**: implemented in `POST /api/saved-templates` — `canUseTier` and the free-tier save limit are re-checked there, not trusted from the client. `MarketplaceBrowser` still checks both client-side first, purely for UX (avoiding a round trip to show an error the server would reject anyway).
- **Rename note**: the old `/api/templates` route (GET/POST for saved templates) has been relocated to `/api/saved-templates`, freeing `/api/templates` for the read-only catalog route.
- **Request validation**: every route validates its input with a Zod schema via [`parseBody`/`parseQuery`](../src/lib/api/validate.ts) before touching Firestore — a malformed body (wrong types, missing fields) is rejected with `400` rather than reaching the Firestore layer.
