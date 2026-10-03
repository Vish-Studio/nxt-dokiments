<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/logo-dark.png" />
  <source media="(prefers-color-scheme: light)" srcset="./docs/assets/logo-light.png" />
  <img src="./docs/assets/logo-light.png" alt="Dokiments logo" width="96" height="96" />
</picture>

# Dokiments

[![PR Checks](https://github.com/Vish-Studio/nxt-dokiments/actions/workflows/pr-checks.yml/badge.svg?branch=dev)](https://github.com/Vish-Studio/nxt-dokiments/actions/workflows/pr-checks.yml)
[![Release](https://github.com/Vish-Studio/nxt-dokiments/actions/workflows/release.yml/badge.svg)](https://github.com/Vish-Studio/nxt-dokiments/actions/workflows/release.yml)
[![GitHub release](https://img.shields.io/github/v/release/Vish-Studio/nxt-dokiments)](https://github.com/Vish-Studio/nxt-dokiments/releases)
[![Node](https://img.shields.io/badge/node-24.12.0-339933?logo=node.js&logoColor=white)](.nvmrc)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Live](https://img.shields.io/website?url=https%3A%2F%2Fdokiments.com&up_message=live&down_message=down&label=deployment)](https://dokiments.com)
[![License](https://img.shields.io/badge/license-proprietary-red)](./LICENSE)

</div>

Dokiments is a business document workspace: users browse a marketplace of
templates (invoices, contracts, quotations, proposals, and more), save the
ones they need, and turn them into polished, exportable documents — all
prefilled from a reusable client book. It's a Next.js App Router PWA backed
by Firebase Auth/Firestore, installable to a home screen, and usable offline.

> ⚠️ **Not the Next.js you know.** This repo runs Next.js 16 (see
> [`package.json`](./package.json)), the current stable release — but one with
> real breaking changes from older versions: route handlers use fully async
> params (`params: Promise<...>`), `middleware.ts` is renamed to
> [`src/proxy.ts`](./src/proxy.ts), and `next lint` is gone (see the `lint`
> script below). Read `node_modules/next/dist/docs/` before assuming familiar
> behavior.

## How it works

- **Marketplace** — a read-only catalog of templates (4 styles × 14 document
  types), seeded into Firestore and served from `/api/templates`.
- **Save & customize** — a user saves a template to their own library
  (`/api/saved-templates`), then creates a document from it
  (`/api/documents`), which snapshots the template's fields at creation time.
- **Client book** — reusable contact details (`/api/clients`) that prefill new
  documents instead of retyping them each time.
- **Export** — documents render to PDF (`jspdf` + `html-to-image`) for
  download/sharing.
- **Auth** — email/password and "Sign in with Google", both implemented as
  server-only calls to Firebase's REST API (no Firebase client SDK, no
  Firebase tokens ever reach the browser). Sessions are signed/encrypted
  cookies via `iron-session`.
- **PWA** — installable, offline-capable (Serwist/service worker), with an
  install nudge and an update banner for users on a stale cached build.

See [`docs/`](./docs) for the full design writeups referenced below.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) on React 19 |
| Styling | Tailwind CSS 4 + [daisyUI](https://daisyui.com) |
| Auth / DB | Firebase Auth + Firestore, called server-side over REST (no Admin SDK, no client SDK) |
| Sessions | `iron-session` (encrypted cookie) |
| Data fetching | TanStack Query |
| State | Zustand |
| Forms / validation | `react-hook-form` + `zod` |
| PDF export | `jspdf`, `html-to-image` |
| PWA | Serwist (`@serwist/turbopack`) |
| Testing | Vitest (unit + browser, via Playwright), Storybook + `addon-vitest`, `addon-a11y` |
| Lint / format | ESLint 9, Prettier |

## Getting started

### Prerequisites

- Node **24.12.0** (see [`.nvmrc`](./.nvmrc) — `nvm use`)
- A Firebase project with **Authentication** (Email/Password, and optionally
  Google) and **Firestore** enabled

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

At minimum you need:

```bash
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
SESSION_SECRET=$(openssl rand -base64 32)
```

`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are only needed for Google
sign-in; `DEV_AUTH_BYPASS=true` skips real Firebase auth in development. See
[`.env.example`](./.env.example) for every variable (analytics IDs, feature
flags, etc.) and [`docs/firebase-auth.md`](./docs/firebase-auth.md) for the
full Firebase Console setup (enabling providers, Firestore, Google OAuth
redirect URIs).

Deploy the security rules once your Firestore project exists:

```bash
firebase deploy --only firestore:rules
```

### 3. Seed the template catalog

The marketplace reads from Firestore, not from hardcoded data, so it needs
seeding once per environment. This requires a Firebase account with
`role: "superadmin"` set on its `users/{uid}` profile — see
[`docs/seed-templates.md`](./docs/seed-templates.md) for the one-time console
setup.

```bash
npm run seed:templates
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve a production build |
| `npm run lint` | ESLint |
| `npm run pre-pr-check` | Lint + build + `vitest run` — run before opening a PR |
| `npm run seed:templates` | Seed/refresh the Firestore template catalog |
| `npm run storybook` | Component workbench at `http://localhost:6006` |
| `npm run build-storybook` | Static Storybook build |

For a type check (not wired to a script), run `npx tsc --noEmit`. For the
full CI-equivalent test run, `npx vitest run`.

## Project structure

```
src/
  app/            # App Router routes: website pages, dashboard, /api/* route handlers
  components/
    website/      # Public marketing site (landing, pricing, FAQ, footer, ...)
    dashboard/     # Authenticated app shell (documents, clients, marketplace, settings)
    commons/       # Shared UI (forms, dialogs, inputs, auth guard/provider, ...)
  lib/
    firebase/      # Server-only Firebase REST client (auth, Firestore collections)
    market-place/  # Static template/style catalog definitions (seed source)
    pdf/, pwa/, promo/, analytics/, auth/, google/, forms/, http/, query/
  hooks/queries/   # TanStack Query hooks per resource
  stores/          # Zustand stores
  types/           # Shared TypeScript types
docs/              # API references and setup guides (see below)
firestore.rules    # Firestore security rules (second gate behind every API route)
scripts/           # One-off scripts (e.g. seed-templates.ts)
```

## Documentation

- [`docs/firebase-auth.md`](./docs/firebase-auth.md) — Firebase/Google OAuth setup
- [`docs/api-templates-documents.md`](./docs/api-templates-documents.md) — templates, saved templates, documents, clients, promo codes
- [`docs/api-feedback.md`](./docs/api-feedback.md) — in-app feedback API
- [`docs/seed-templates.md`](./docs/seed-templates.md) — seeding the template catalog
- [`docs/postman-collection.json`](./docs/postman-collection.json) — importable Postman collection for the API

## Testing

- **Unit/DOM tests** live alongside their source files (`*.test.ts(x)`) and run via Vitest.
- **Storybook** stories double as browser tests through `@storybook/addon-vitest` (Playwright-driven).
- Run everything CI runs locally with:

  ```bash
  npm run lint && npx tsc --noEmit && npx vitest run && npm run build
  ```

## Git workflow & deployment

Branches promote linearly: **`dev` → `staging` → `prod`**. Feature branches
are named after their tracking ticket, e.g. `DOK-64-short-description`.

- Every PR into `dev`, `staging`, or `prod` runs **[PR Checks](./.github/workflows/pr-checks.yml)**: lint, type check, `vitest run`, and a production build.
- Pushing to `prod` runs **[Release](./.github/workflows/release.yml)**, which tags `vX.Y.Z` (from `package.json`'s version) and publishes a GitHub Release with auto-generated notes. The version is bumped by hand on `dev` (`npm version <major|minor|patch> --no-git-tag-version`) before promotion — CI only tags, it never decides the number.
- Hosting is [Vercel](https://vercel.com), wired to the Git integration (`NEXT_PUBLIC_SITE_URL` defaults to the production URL).

## Contributing

1. Branch from `dev`.
2. Run `npm run pre-pr-check` before opening a PR — this is what CI enforces.
3. Open the PR against `dev`.
