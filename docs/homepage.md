# Homepage and marketing mockups

The homepage (`src/components/website/landing/landing.tsx`) sells the product with
pictures of the product itself. Every visual is a real app screen, a real
template, or a real component, so the site stays truthful as the app changes.
The UI rules are in the `dokiments-ui` skill ("Website mockups are the real
app").

## Sections with product visuals

| Section | Component | Visual |
| --- | --- | --- |
| Hero (right column) | `HeroShowcase` → `HeroProductMockup` | **Desktop (`lg`+):** step 1 shows the workspace photo, `hero-laptop-rock.webp` (the dashboard on a laptop on a log) with `hero-mobile-cutout.webp` floating over it; steps 2 and 3 show the Client and Send PDF scenes below. **Phones and tablets:** one device scene per hero step, cross-fading as the step changes: **Template** = marketplace on the laptop on a rock; **Client** = My Clients and a prefilled invoice on two iPhones (blue); **Send PDF** = finished invoice on a MacBook plus "Document ready" on an iPhone (purple) |
| Your whole document workspace | `FeatureTabs` → `FeatureTabVisual` | Six tabs in the app's sidebar order (Dashboard, My Documents, CVs, My Templates, My Clients, Marketplace), each a real page in `DeviceBrowser` on its page tone (CVs on noir). Not shared with the auth pages |
| How it works | `Workflow` → `WorkflowStep` | Text only: numbered markers on a connector, no images |
| Share and e-sign | `SignShowcase` → `SignShowcaseMockup` | Share dialog still, status card with `ShareTimeline`, `SignedSignature`, floating notification. **Only when document sharing is on** |
| Use cases | `UseCases` → `ShowcaseCard visual` | One `ShowcaseDocument` per audience (quotation, NDA, proposal, purchase order) |
| Mid-page CTA | `ConversionCta visual` | `ConversionCtaDocuments`: a fan of three documents (desktop only) |
| CVs for students | `CvShowcase` → `CvShowcaseMockup` | One student's CV (`studentCvValues`, `src/lib/website/student-cv.ts`) in the Classic, Modern and Minimalist CV templates, fanned on pink, with a style picker. Copy says only Classic is free |
| On your phone | `MobileShowcase` | Company page phone, plus the notifications phone when sharing is on |
| Share images | `src/app/opengraph-image.png`, `twitter-image.png` | 1200 × 630, the dashboard in a browser on noir with a signed notification |

The hero's step state lives in `HeroIntro`; `HeroShowcase` (a client component
rendering both grid cells) mirrors it into `HeroProductMockup` through
`onStepChange`; only the phone layout uses it. Scenes are listed in `heroScenes` (`src/lib/website/app-screens.ts`),
keyed by the step `id` in `hero-intro-steps.ts`.

Order: Header, Hero, Workflow, TemplateStrip, FeatureTabs, SignShowcase,
Confidence, UseCases, ConversionCta, ClientsShowcase, CvShowcase, MarketplaceShowcase, …,
StyleSwitcher, MobileShowcase, then the rest.

## Navigation

`src/lib/website/navigation.ts` holds the links. The header (and its phone
menu) has five, in page order: How it works (`#workflow`), Features
(`#overview`), CVs (`#cvs`), Templates (`#marketplace`), FAQ (`#faq`). The
footer's Product column adds Use cases and Clients. Keep the header at five so
it fits beside the logo and auth buttons at 1024px.

## Building blocks

- **`DeviceBrowser`** (`device-browser/`): a dark browser window around a
  screenshot. `tone="light"` adds the soft shadow for white or pastel panels.
- **`DevicePhone`** (`device-phone/`): a phone bezel, camera island and 9:41
  status bar around a 393 × 852 screen. Sizes are in `cqw` of the
  `@container` wrapper, so it scales from a hero inset to a full section.
- **`ShowcaseDocument`** (`showcase-document/`): a catalog template rendered as
  paper through `TemplateThumbnail`. Pass `compact` when it is narrower than
  about 160px, and `values` to tell it for a particular reader (the student
  CV). Unknown ids render nothing.
- All of them are decorative: their wrappers are `inert` and `aria-hidden`, and
  screenshots carry an `alt` from `appScreens`.

## Refreshing the app screens

The screenshots in `public/images/mockups/app/` come from Storybook stories, so
they show seeded data and never a real account.

```bash
npm run storybook
```

```bash
npm run capture:marketing
```

`scripts/capture-marketing-screens.mjs` loads the app fonts, dismisses the
announcement bar, drives the stories (opening an editor, prefilling a client,
opening "Download PDF") and writes WebP files. Whole pages come from the
`Dashboard/App Shell Pages` stories, which share one set of sample data.

| File | Source | Size |
| --- | --- | --- |
| `dashboard-desktop.webp` | `dashboard-app-shell--dashboard-home` | 1440 × 900 at 2× |
| `documents-desktop.webp`, `cv-desktop.webp` | `…-pages--my-documents-page` (CV: CVs tab → Edit) | 1440 × 900 at 2× |
| `templates-desktop.webp`, `clients-desktop.webp`, `marketplace-desktop.webp` | the matching `…-pages--*-page` story | 1440 × 900 at 2× |
| `company-phone.webp` | `dashboard-app-shell--company-sub-page` | 393 × 852 at 3× |
| `notifications-phone.webp` | `dashboard-notification-bell--visual` (open) | 393 wide at 3×, cropped to the sheet |
| `hero-template.webp` | marketplace capture warped onto `hero-laptop-rock.webp` (CSS `matrix3d`, clipped to the visible screen) | 2400 × 1800 |
| `hero-client.webp` | My Clients and prefill phone captures in `hero-mobile-cutout.webp` frames, with a 9:41 status bar | 2400 × 1800 |
| `hero-send.webp` | invoice editor in `hero-laptop-cutout.webp`, "Document ready" phone in front | 2400 × 1800 |

The three device photos are only sources for the scenes; keep them in
`public/images/mockups/`.

If you change a size or add a screen, update `src/lib/website/app-screens.ts` in
the same change. Recapture after any visible dashboard change.

The Marketplace promo banner reuses these screens. `npm run compose:banners`
(`scripts/compose-marketplace-banners.mjs`) writes
`public/images/marketplace/promo-*.webp`: transparent 1400 × 1080 images of a
dark browser window bleeding off the bottom-right, with an iPhone in front on
two of them. Run it after `capture:marketing`. Which slide uses which image,
and the copy rules, are in the `dokiments-ui` skill (Marketplace layout).

| Banner image | Desktop screen | Phone screen |
| --- | --- | --- |
| `promo-documents.webp` | My Documents | company page |
| `promo-clients.webp` | My Clients | none |
| `promo-templates-offer.webp` | Dashboard (plan, free slots) | notifications |
| `promo-templates.webp` | My Templates | none |
| `promo-cv.webp` | a CV in the editor | none |

## Server and client boundaries

- Website components import Phosphor from `@phosphor-icons/react/dist/ssr` so
  they stay server components.
- `ConversionCta` is a client component. Its illustration comes in through the
  `visual` slot, rendered on the server, so the template catalog is not shipped
  to the browser.
- `NotificationListItem` is `"use client"`: it uses Phosphor's client entry and
  the homepage renders it inside server components.
- Notification and timeline times are fixed `Date.UTC` values, so server and
  browser render the same text.

## Feature flag

`NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED` (inlined at build time) hides
`SignShowcase` and switches `MobileShowcase` to one phone with "Stay up to date"
wording. Stories cover both (`MobileShowcase` SharingOn / SharingOff).
