# Admin portal

A superadmin's view of the product and its accounts, at `/admin`. Built to the
approved design canvas ("Dokiments Admin Portal") with the app's own shell and
components.

## Access

- A superadmin is an account with `role: "superadmin"` on `users/{uid}`. Roles
  are set in the Firebase console; the portal cannot change them.
- After sign-in a superadmin lands on `/dashboard` like everyone else. The only
  difference in the app is one extra sidebar row, **Admin portal**, above
  Settings (`adminNavigationItem`, shown when `isSuperadmin(user)`).
- Three gates, each enough on its own:
  1. Every `src/app/admin/**/page.tsx` calls `await requireSuperadmin()`
     (`src/lib/admin/require-superadmin.ts`), which answers `notFound()` to
     anyone else. It is called in each page, not a layout, because layouts do
     not re-render on client navigation.
  2. Every `src/app/api/admin/**/route.ts` is wrapped in `withSuperadmin`
     (`src/lib/api/with-superadmin.ts`), which re-reads the role from Firestore
     (the session copy can be an hour old) and answers `404`, not `403`.
  3. `firestore.rules` grants the reads to `isSuperadmin()` only.
- `src/lib/admin/admin-pages.test.ts` fails if a page or route skips its gate.
- `/admin` is in the proxy's protected prefixes, so signed-out visitors go to
  sign-in first.
- The dev auth bypass user has role `special`, so the portal 404s under it. Sign
  in with a real superadmin account to test.

## Shell

`AppShell` takes `area="admin"`: the sidebar shows `adminNavigationSections`
(Overview; People; Content; Engagement; Platform) with **Open app** at the foot,
and the customer banners (promo, launch, verify email, onboarding) are left out.
Each admin page keeps the banner tone of the app area it looks after
(`pageThemes` in `app-shell.tsx`). Sharing's row and pages disappear when
document sharing is switched off.

## Pages and data

| Route | Data | Source |
| --- | --- | --- |
| `/admin` Overview | Accounts, plans, feedback, sign-ups: real. Document mix and admin actions: sample | `/api/admin/users`, `/api/admin/feedback` |
| `/admin/users`, `/admin/users/[uid]` | Real | `/api/admin/users`, `/api/admin/users/{uid}` |
| `/admin/plans` | Counts and features real; change history sample | users + `getPlanFeatures` |
| `/admin/templates` | Real (what customers see) | `/api/templates` |
| `/admin/marketplace-banner`, `/admin/marketplace-banner/[id]` | Sample, editable in-session (see below) | `marketplace-banner/dummy-data.ts`, `admin-banner-store` |
| `/admin/documents` | Sample | `documents/dummy-data.ts` |
| `/admin/sharing`, `/admin/sharing/[id]` | Sample | `sharing/dummy-data.ts` |
| `/admin/feedback` | Real; reply opens the admin's email app | `/api/admin/feedback` |
| `/admin/newsletter` | Real, with CSV export | `/api/admin/newsletter` |
| `/admin/promotions` | Campaigns real (`promo-codes.ts`); usage sample | `promotions/dummy-data.ts` |
| `/admin/notifications` | Push flag real; devices and sends sample | `notifications/dummy-data.ts` |
| `/admin/system` | Real: flags, config checks (presence only), version, administrators | `/api/admin/system` |
| `/admin/audit` | Sample | `audit/dummy-data.ts` |

Every sample area shows an `AdminSampleNotice` and is listed in
`src/lib/admin/sample-data.ts`.

## Marketplace banner

Two pages, matching the "Marketplace banner flow" row of the design canvas:

1. **Slides** (`/admin/marketplace-banner`): the live banner exactly as customers
   see it (the real `MarketplacePromoCarousel`), then `TabMenu` tabs Live /
   Scheduled / Drafts and one `DashboardList` row per slide. Live slides are
   reordered with up/down arrows (`moveSlide` skips slides of another status).
   The row's ⋮ menu holds Duplicate (opens the copy as a draft), Hide from
   banner or Open to publish, and a red Delete behind a `ConfirmDialog`.
2. **Slide editor** (`/admin/marketplace-banner/[id]`, `new` for a blank draft):
   the form in three sections (Words, Look, Button and timing) beside a sticky
   live preview (the real `MarketplacePromoSlide`, desktop or phone). Colours,
   images and icons are picked by sight (`AdminChoiceGroup`); the button opens a
   page from `bannerDestinations`, never a typed URL. Publishing validates
   (`validateBannerSlide`), then confirms where the slide will appear. A live
   slide offers Hide from banner and Save changes instead of Save draft and
   Publish.

Status is derived, never stored: `getSlideStatus` turns `state` and the
optional Show from / Until dates into draft, scheduled, live or ended. Both
pages share `useAdminBannerStore`, which starts from the sample slides and lasts
for the browser session.

## Moving a sample area to Firestore

Each `src/lib/admin/<area>/dummy-data.ts` exposes one getter and says, in its
header comment, what is missing (a collection, a rule, a counter). To make an
area real: add the collection and its rule (with a rules test), add a
`server-admin.ts` reader and an `/api/admin` route wrapped in `withSuperadmin`,
add a hook to `use-admin.ts`, swap the view's getter for the hook inside
`AdminQueryState`, remove the notice, and delete the area from
`sampleDataAreas`.

- **Audit log**: `auditLog/{id}`, append-only, written by every admin write route. Add it before any admin write (plan change, suspend).
- **Marketplace banner**: `siteContent/marketplaceBanner` (read signed in, write superadmin); `MarketplacePromoBanner` reads the live slides with today's code slides as fallback.
- **Sharing**: a superadmin read on `sharedDocuments` exposes signatures and values; needs a security review first.
- **Documents, promo usage, push stats**: counters or aggregates written server-side; never open per-user collections or push endpoints to admins.

## Not in v1

No plan changes, suspensions or deletions (nothing records admin actions yet),
no feedback statuses (the collection is append-only), no feature-flag toggles
(they are build-time environment variables), and no paging on the users list
(it reads the whole collection, like the other list helpers).

## Deploying

The newsletter read rule is new: run `npm run test:rules`, then
`firebase deploy --only firestore:rules`. Until then the Newsletter page shows
its error state.
