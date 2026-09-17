---
name: dokiments-ui
description: Use when modifying Dokiments frontend UI, dashboard shell, marketing components, or reusable components in this repo. Enforces strict modular folder structures, Bento-grid layouts, flat/neo-brutalist aesthetics, and consistent spacing tokens.
---

# Dokiments UI

As an elite Fullstack Engineer and Award-Winning UI/UX Designer specialized in high-conversion marketing sites and ultra-clean dashboard apps:

## 1. Code Architecture & Component Hygiene

- **Strict Anti-Bloat Rule:** NEVER write multiple sub-components within the same file. If a UI area contains a distinct, reusable subpart, it _must_ be extracted into its own file inside its respective directory. Keep component files short, focused, and single-purpose to maintain an accessible codebase for junior/mid-level developers.
- **Component Style:** All components must be written as TypeScript arrow functions with explicit prop interfaces (`interface Props {}`). They should also include their component name as their first classname (e.g., `<div className="template-card">` for `TemplateCard`).
- **Storybook Coverage:** Every new component must include a colocated story file within its folder (`stories/[component-name].stories.tsx`).
- **Storybook Sidebar Titles:** Every story meta must set an explicit `title` grouped by component bucket only (`Commons/Button`, `Dashboard/Sidebar`, `Website/Hero`). Do not allow Storybook to infer paths that expose `stories` as a sidebar nesting level.
- **State Management:** Shared global UI state belongs in `src/stores/ui-store.ts`. Use it sparingly (e.g., sidebar state, theme tracking); prefer props or local React state for localized hierarchies.

## 2. Strict Directory Structure

All UI components must reside exactly within one of these four subdirectories under `src/components/`:

- `src/components/commons/` — Globally reusable foundational atomic elements (buttons, inputs, dropdowns, modals, loaders) that extend DaisyUI with a flat design language.
- `src/components/website/` — High-converting marketing components matching an Awwwards-winning visual standard (editorial typography, sophisticated layouts, immersive dark sections).
- `src/components/dashboard/` — Modular components specifically built for the core user application (data cards, metric tracking, bento modules).
- `src/components/admin/` — Management views, configuration tables, and analytics modules reserved exclusively for privileged accounts.

## 3. Visual & Aesthetic Guidelines (Awwwards x Bento Style)

- **Aesthetic Direction:** Merge a premium, minimalist dark-mode canvas with "flat design" principles. Avoid heavy gradients, soft outer blurs, or realistic skeuomorphism. Use sharp borders, high-contrast typography hierarchies, and intentional whitespace.
- **Bento Grid Dashboard:** Construct dashboard layouts using structured CSS Grid tracks (`grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4`). Every card inside the Bento layout must be a dedicated module from `components/dashboard/`, utilizing flat borders, unified internal padding (`p-6`), and clear structural boundaries.
- **DaisyUI Extension Strategy:** Utilize semantic DaisyUI utility classes, but enforce a flat design aesthetic by overriding radiuses and soft shadows with sharp utility classes (`rounded-md`, `border`, `border-base-content/10`, `shadow-none`).
- **Tokens Over Magic Numbers:** Use Tailwind tokens and DaisyUI classes configured in `src/app/globals.css`. Never use hardcoded hexadecimal colors or arbitrary spacing utilities (e.g., use `p-6` or `gap-4` instead of `p-[23px]`).
- **Typography (two families only):** `Urbanist` is the sole typeface for all body copy and headings — always go through the `font-body`/`font-title` tokens (both resolve to Urbanist) and never reintroduce another family. `Raleway` at weight 900 ("Black") is reserved exclusively for the Dokiments logo — apply `font-logo` + `font-black` to the wordmark and the "D" mark, nowhere else. Fonts are loaded via `next/font/google` in `src/app/layout.tsx` (`--font-urbanist`, `--font-raleway`).
- **Control Hierarchy:** Keep buttons, inputs, and tabs visually distinct. Primary buttons are solid black (`btn-primary`, white text — never golden); `secondary` is a soft grey fill; `outline` is bordered; `ghost` is text-only. All text CTAs across the website and dashboard use the compact rectangular `rounded-field` radius, matching the subscription plan actions; do not use `rounded-box` or `rounded-full` for CTA buttons. Icon-only controls retain their intentional circle/square shapes. Inputs/selects use a slight grey fill (`bg-base-200`) with a calm focus treatment (`focus:border-nox-noir focus:ring-2 focus:ring-nox-noir/15`), never heavy double outlines. Tabs use an underline (bottom-border) indicator so they never read as buttons. Do not use the retired deep-purple utility class; the product palette should rely on `bg-nox-noir`, `bg-golden-harvest`, and the pastel page colors.
- **Dropdowns:** Use the shared `Dropdown` component from `components/commons/dropdown` for every application selection menu. Its exported `dropdownControlClassName` is the canonical sort/filter treatment: a `rounded-field`, `border-steel-mist` control on `bg-base-200`, with compact typography and a calm expanded state. Compose responsive width or size adjustments onto that class instead of creating native `<select>` controls or bespoke menu treatments. Dropdown option lists use the same bordered base surface, grouped labels, and checked selected state.
- **Website Hero Discipline:** Marketing hero sections must be high-conversion and edited. Keep the left side focused on one clear promise and two CTAs maximum. Keep all hero content inside the main white hero container. The right side should show one refined, light, product-led mockup or outcome preview, not a heavy black frame, a dashboard dump, stacked metrics, duplicate CTAs, unrelated mini-cards, or filler widgets. Use the mockup to communicate the actual app flow: marketplace template → saved template → document preview.

## 4. App Shell & Layout Rules

- **Shell Division:** Main app shell pieces live under `src/components/dashboard/` and are broken down into: `app-shell`, `sidebar`, `topbar`, and `content-container`. Do not prefix these component names with `dashboard`.
- **Topbar Control:** The topbar sits on the dark app background above the white main content panel and aligns with the sidebar logo row. It shows _only_ the page title and right-side action items. Personalized copy like `Hello, Anthony!` belongs inside the main canvas panel, never the topbar.
- **User Navigation:** The topbar user menu lives in `user-dropdown`; never render the raw user email inside the topbar trigger.
- **Sidebar UX:** When the desktop sidebar is collapsed, clicking the logo expands it. Do not show a duplicate hamburger or toggle icon in the collapsed view. Keep the logo and nav icons perfectly centered on the vertical centerline. Sidebar bottom controls must separate into `theme-toggle` placed directly above `settings-nav-item`.
- **Responsive Viewports:** On mobile/tablet, the main content panel scales to full viewport dimensions. The topbar remains pinned/sticky, introducing a navigation trigger beside the title that toggles the sidebar as an off-canvas overlay.

## 5. Integrations & Guards

- **Icons:** Use Phosphor Icons (`@phosphor-icons/react`) exclusively for all dashboard controls, navigation, and state indicators.
- **Forms & Validation:** Auth and settings UI must use React Hook Form combined with the modular inputs from `src/components/commons/`. Keep form containers isolated in their own folder tracks.
- **Firebase Infrastructure:** Client integrations live in `src/lib/firebase`, consuming REST APIs wired through `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, and `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
- **Dev Auth Bypass:** Local development may bypass Firebase auth with `NEXT_PUBLIC_DEV_AUTH_BYPASS="true"`. The bypass must remain gated by `process.env.NODE_ENV === "development"` and should use `src/lib/dev-auth.ts` rather than scattering mock-user logic across components.
- **RBAC:** Application roles map to `superadmin`, `free`, `silver`, `gold`, and `special`. Defaults to `free`. Client-side route blocking is enforced by wrapping views with `AuthGuard`, composed within the `AppShell`.

## 6. Marketplace, Templates & Documents

- **Form section icons:** Pair each `TemplateForm` legend with a neutral Phosphor icon: file for document details, user for sender, identification card for recipient, list for content/items, currency for amounts, and signature for closing. Use `size-5`, `shrink-0`, `gap-2`, and `aria-hidden`; retain visible titles without adding explanatory text or decorative icon backgrounds.

- **Document editor forms:** `TemplateForm` uses title-only sections with no explanatory paragraphs: Document details, Your details, Client details (invoice/quotation/receipt; otherwise Recipient details), Items or Content, Amounts, and Signatures & closing. Preserve NDA party labels and hide empty groups. Use semantic fieldsets, `mb-5` below legends, `gap-8` between sections, subtle top dividers, and `gap-4` between fields. Keep document name in Document details and `ClientPicker` inside Recipient. Party inputs follow name → phone → email → address → BRN. Grouping is presentation-only and must preserve all field keys, values and change callbacks, including unknown saved-template fields in Content.

- **Document layout:** `TemplateDocument` reuses the borderless two-column `TemplateParties`: name → phone number → email → multiline address; BRN follows when present. Optional blank contacts are omitted. Use `mb-8` before metadata/body. `withPartyContacts` adds optional sender/recipient contact inputs for existing templates without rewriting snapshots; prefill uses the same fields. Preserve NDA Disclosing/Receiving labels and omit parties for meeting minutes. Letters display greeting → body → closing/signature; billing documents place saved totals after items and before payment notes; signatures/approvals follow body sections. Invoice/quotation `LineItemsEditor` supports description, quantity and unit price, stored as a versioned JSON string in the existing `items` value; `DocumentItems` renders rows and quantity × price amounts. Preserve legacy free text verbatim (no guessed prices); document subtotal/tax/total remain manually reviewed. Never change API payload types or rewrite existing saved values on read.

- **Template catalog:** Templates live in `src/lib/market-place/` as `<style>/<document>.ts` leaf files (e.g. `classic/contract.ts`), each composing a `style` (`styles.ts`) with a document `blueprint` (`documents.ts`, the shared field definitions). The barrel `index.ts` exposes helpers: `marketplaceTemplates`, `getTemplateById`, `listTemplatesByStyle`, `canUseTier`, `tierLabels`, `getSampleValues`. Add new documents by extending `documents.ts` + a leaf per style; add new styles by extending `styles.ts` + leaves.
- **Sample content:** `sample-data.ts` holds realistic dummy values per document type. `TemplateThumbnail` and the preview default to these so users see a filled document, not empty placeholders.
- **Styles & tiers:** Styles map to subscription tiers (Classic = free, Modern = silver, Minimal = gold). Tier and status labels use the shared `Badge` component from `src/components/commons/badge/badge.tsx`: Free = green (`bg-success`), Silver = golden, Gold = black/noir (mirrors the plan-card backgrounds). Gating is via `canUseTier(role, tier)` — any tier can be previewed, but saving/using a locked tier requires upgrading (`/subscription`).
- **Marketplace layout:** Categorized by style; each style's cards render in a horizontal `Carousel`. The page opens with the full-width `MarketplacePromoBanner` before category navigation. It is a three-slide news carousel: launch offer → Clients workspace → growing template library. Every slide uses one relevant full-bleed Unsplash image, a flat `bg-nox-noir/70` overlay for contrast, white editorial copy, and one contextual existing `LinkButton`. Keep it border-led and gradient-free. Use Marketplace teal (`bg-play-teal` / `text-play-teal`) for the slide marker and eyebrow, neutral carousel controls, and the shared rectangular accent CTA for slide actions. `MarketplacePromoCarousel` owns one taller fixed `h-96` frame at every breakpoint; each `MarketplacePromoSlide` must use `h-full`, never its own height token, so all content variants occupy the same unclipped banner height. Its arrow SVGs require explicit `text-base-100` / `text-nox-noir` colors so they remain visible over image surfaces. Use the dedicated `MarketplacePromoCarousel` here—not the shared sliding `Carousel`—so a fixed promo container swaps slides with a short fade, avoiding adjacent slide edges during transitions. It retains accessible previous/next `ButtonIcon` controls and pauses autoplay and animation for reduced motion. Marketplace categories use the shared `Carousel` at every breakpoint with `navigationPlacement="header"`, placing visible previous/next controls beside “Browse by category” to signal the horizontally scrollable rail.
- **Preview:** Opens in the reusable right-hand `SidePanel` drawer (flat, slides in via `.side-panel-enter`), rendering the `TemplateDocument` with sample content.
- **Persistence & flow:** Owned templates live in `templates-store` (ownership only — no values), created documents in `documents-store`; both are per-`uid` and persisted with zustand `persist`. Flow: Marketplace saves a template → **My Templates** is a read-only gallery of owned templates (thumbnails, no editing) → **Documents** creates/edits a concrete document from an owned template (name + `TemplateForm` on the left, live `TemplateDocument` render on the right).
- **Reusable building blocks:** Prefer `PlanCard` (used by subscription + website pricing), `TemplateDocument` (style-aware renderer), `TemplateThumbnail`, `Carousel`, and `SidePanel` over re-implementing these patterns.

## 7. Shared Dashboard Patterns

- **Dashboard lists:** Use `DashboardList` for the responsive 12-column header, surface, and borders. Keep entity-specific row data and actions in components such as `DocumentListItem` and `ClientList`.
- **Collection surfaces:** My Documents, My Clients, and My Templates use full-width, full-available-height rounded collection surfaces. Tables fill the available surface width, and the template gallery lives inside the same type of surface rather than floating on the canvas. Group the collection toolbar with its surface: use `pt-6` from the page banner and `gap-2` before the collection surface.
- **Right-side panels:** Use `SidePanel`, matching its `tone` to the active `PageBanner`: Documents `purple`, My Templates `pink`, Marketplace `teal`, and My Clients/Dashboard `golden`. Place panel actions in its `footer`.

## 8. Verification Checklist

Before declaring a task complete, verify stability with:

1. `npm run lint` — Zero syntax or formatting style errors.
2. `npx tsc --noEmit` — Compiles cleanly without TypeScript type mismatches.
3. Verify component isolation across Storybook variations.
