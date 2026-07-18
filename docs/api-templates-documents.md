# API Plan — Templates, Saved Templates, Documents

This documents the target shape of three route groups before implementation starts:

- `/api/templates` — read-only marketplace catalog, served from Firestore instead of the static bundle in `src/lib/market-place/`.
- `/api/saved-templates` — per-user library of templates a user has added from the marketplace (replaces the current `/api/templates` route and the `savedTemplates` array field on `users/{uid}`).
- `/api/documents` — per-user documents created from a saved template (replaces the localStorage-only `documents-store.ts`).

Build order: `templates` → `saved-templates` → `documents`, since each depends on the one before it (a saved template references a template; a document references a saved template's data).

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
| `GET` | `/api/templates` | List the full active template catalog (all styles × all document types) for the Marketplace browser. | None required — the catalog itself isn't sensitive; tier gating happens client-side against the user's role same as today. | Optional query params: `styleId` (filter by style), `tier` (filter by tier). | `200 { templates: MarketplaceTemplate[] }` | `GET` because this is a pure read with no side effects and is cacheable (short `revalidate` window) — matches how the client currently just imports a static array. |
| `GET` | `/api/templates/:id` | Fetch a single template's full definition (used when hydrating a saved template or a document's template reference, and for direct-link previews). | None required. | — | `200 { template: MarketplaceTemplate }` / `404` if not found or inactive. | Split from the list route so `saved-templates` and `documents` can resolve one template by ID without pulling the entire catalog over the wire. |

**Not included in this pass:** `POST`/`PATCH`/`DELETE` — those belong to the admin CRUD phase once the freeform-vs-fixed-taxonomy decision is made. Until then, the catalog is seeded directly (script or Firestore console) and this route group is read-only.

---

## `/api/saved-templates`

The user's personal library — templates they've added from the Marketplace, shown under **My Templates**. Replaces today's `/api/templates` route (which is misnamed relative to its actual job) and the `savedTemplates` array field on `users/{uid}`, migrating to a subcollection so each save/remove is a single-document write instead of a whole-array overwrite.

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `GET` | `/api/saved-templates` | List the signed-in user's saved templates, hydrated with full template data (name, fields, style) so My Templates and the document picker don't need a second round trip. | Session required (`401` if absent). | — | `200 { savedTemplates: Array<{ templateId, savedAt, template: MarketplaceTemplate }> }` | `GET` — read with no side effects. Hydration (vs. returning bare IDs) trades one extra server-side batched Firestore read for eliminating a client-side join and a second network round trip, matching what `MyTemplatesView` and `DocumentsView` need directly. |
| `POST` | `/api/saved-templates` | Save one template to the user's library. | Session required. | `{ templateId: string }` | `201 { templateId, savedAt }` on save; `200` (no-op) if already saved. | `POST` on the collection to create one join record. Chosen over reusing the old "send the whole array" `POST` because each save is now a single-document write (`PATCH` with doc ID = `templateId`, effectively an upsert) — idempotent, no race with a concurrent save/remove in another tab. Server re-validates the tier/limit check (`canUseTier`, free-tier cap) that today only runs client-side, since this is a trust boundary. |
| `DELETE` | `/api/saved-templates/:templateId` | Remove one template from the user's library. | Session required. | — | `204` on success; `404` if not saved. | `DELETE` on the specific resource path, not a `POST` with a mutated array — removes exactly one document, no read-modify-write cycle, no risk of clobbering a save that happened in another tab a moment earlier. |

**Why not `PATCH` or `PUT`:** a saved-template record has no mutable fields of its own (it's a pure join: `templateId` + `savedAt`) — there's nothing to update in place, only create or remove.

---

## `/api/documents`

User-created documents — filled-in instances of a saved template. Replaces the Zustand `persist`-to-`localStorage` behavior in [`documents-store.ts`](../src/stores/documents-store.ts), which is the one real data-loss risk in the app today (a user's actual business documents live only in their browser's local storage).

| Method | Route | Purpose | Auth | Request | Response | Why this method |
|---|---|---|---|---|---|---|
| `GET` | `/api/documents` | List all of the signed-in user's documents (for the Documents list view). | Session required. | Optional `templateId` filter. | `200 { documents: UserDocument[] }` | `GET` — straightforward list read, scoped to the caller's own subcollection so no `uid` needs to be passed. |
| `GET` | `/api/documents/:id` | Fetch one document (used when opening the editor or the preview/export dialog on a full page load rather than from already-loaded list state). | Session required; must own the document. | — | `200 { document: UserDocument }` / `404`. | Separate single-item read so the editor doesn't depend on the list already being in memory — supports direct links/refreshes. |
| `POST` | `/api/documents` | Create a new document from a saved template. | Session required. | `{ name, templateId, values }` | `201 { document: UserDocument }` | `POST` to create a new resource with a server-generated ID. At creation time the server snapshots the template's current `name`, `style`, and `fields` onto the document (`templateSnapshot`) rather than storing only a live `templateId` reference — so a later template edit or deletion in the admin catalog can't retroactively change or break a document a user already finished and possibly exported/signed. `templateId` is still stored for "recreate from this template" convenience, but rendering always uses the snapshot. |
| `PATCH` | `/api/documents/:id` | Update a document's `name` and/or `values` (editing an existing document). | Session required; must own the document. | `{ name?, values? }` — partial. | `200 { document: UserDocument }` | `PATCH` rather than `PUT` because updates are partial (the editor only sends changed fields, matching the existing `updateDocument(uid, id, patch)` store signature) and the `templateSnapshot` is immutable after creation — this route never touches it. |
| `DELETE` | `/api/documents/:id` | Delete a document. | Session required; must own the document. | — | `204` on success; `404` if not found / not owned. | Standard resource deletion, single-document write, matches the existing `removeDocument` action. |

**Why a subcollection (`users/{uid}/documents/{docId}`) instead of a `documents` array field or a top-level collection:** each document can be edited independently without a read-modify-write of every other document (unlike the old `savedTemplates` array pattern), avoids the 1 MiB per-document Firestore size ceiling as a user accumulates documents, and keeps ownership checks trivial (`request.auth.uid` must equal the parent path segment) without needing a `uid` field + composite index the way a top-level collection would.

---

## Cross-cutting notes

- **Auth pattern**: every session-gated route follows the existing pattern in [`src/app/api/templates/route.ts`](../src/app/api/templates/route.ts) — pull `getIronSession`, 401 if `!session.user`, call a `server-*.ts` Firestore helper with `session.idToken`.
- **Ownership enforcement**: for `saved-templates` and `documents`, the `uid` in the Firestore path always comes from the session, never from the request body/URL — a user can never act on another user's subcollection regardless of what ID they pass.
- **Server-side tier re-validation**: `POST /api/saved-templates` must re-check `canUseTier` and the free-tier save limit server-side. Today this check only exists client-side in `MarketplaceBrowser`, which is fine for UX but not for enforcement once this is a real API a client could call directly.
- **Rename note**: the current `/api/templates` route (GET/POST for saved templates) will be renamed to `/api/saved-templates` as part of this work, freeing `/api/templates` for the new read-only catalog route.
