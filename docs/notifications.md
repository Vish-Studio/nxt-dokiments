# Notification center

The bell in the dashboard header (`NotificationBell`) renders one merged list of
`AppNotification`s (`src/types/notification.ts`). It does not know where an item
comes from, so new kinds plug in without touching the UI.

## Existing sources

| Kind | Where it runs | Read state |
| --- | --- | --- |
| `template` | Server (`serverNotificationSources`) — derived from `templates/{id}.createdAt` | `users/{uid}/notificationMeta/state.lastSeenAt`, set by "Mark all as read" |
| `app-update` | Client (`useAppUpdateNotifications`) — fed by `useAppUpdate` through `app-update-store` | Persistent: shown until the update is applied |

Templates added within 10 minutes of each other are announced as one notification.
Items older than 14 days drop off. **A template only notifies if it has a
`createdAt` timestamp** — `npm run seed:templates` sets it for new templates only
and never rewrites it on a re-seed. Any future admin write path must do the same.

To add `createdAt` to templates that predate this, run
`npm run backfill:template-created-at` (same env as `seed:templates`). It only
fills templates missing the field and defaults to 30 days ago, so the existing
catalog is *not* announced as new. To trigger notifications on purpose (e.g. to
test the bell), run it for specific templates:
`BACKFILL_TEMPLATE_IDS=modern-invoice,classic-nda BACKFILL_CREATED_AT=now npm run backfill:template-created-at`.
It skips templates that already have a `createdAt`; add `BACKFILL_FORCE=1` (only
allowed together with `BACKFILL_TEMPLATE_IDS`) to overwrite one when re-testing.

## Endpoints

- `GET /api/notifications` → `{ notifications: AppNotification[] }`, newest first,
  aggregated from every server source. A failing source is skipped.
- `POST /api/notifications/read` → `{ lastSeenAt }`. Marks everything up to now read.

The client polls every 60 seconds and on window focus.

## Adding a new kind

**Server-derived** (needs per-user or database data):
1. Add a `ServerNotificationSource` to `serverNotificationSources` in
   `src/lib/notifications/server-sources.ts`. Return items with a unique
   `id` (`"<kind>:<key>"`) and `createdAt`; `read` is decided by the route.
2. Optionally add an icon for the `kind` in `kindIcons` (`notification-bell.tsx`).

**Client-only** (browser state, like app updates):
1. Write a hook returning `AppNotification[]` (see `use-app-update-notifications.ts`).
   Use `action.onClick` for in-page actions and `persistent: true` for conditions
   that should stay until they clear.
2. Call it in `useNotifications` (`src/hooks/notifications/use-notifications.ts`)
   and add it to the merged list.

If a future kind needs per-user stored records (e.g. billing events), write them
under `users/{uid}/…` and expose them through a new server source; the API and UI
stay the same. Deploy `firestore.rules` after pulling this change
(`firebase deploy --only firestore:rules`).
