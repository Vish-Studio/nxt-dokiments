# Copilot instructions for Dokiments

Dokiments is a business-document workspace: a template marketplace, a saved-template library, documents prefilled from a client book, PDF export, and document sharing with e-sign. It is a Next.js App Router PWA backed by Firebase Auth and Firestore, called **server-side over REST** (no Admin SDK, no client SDK). Read `README.md` and `docs/` for design write-ups.

## Read first

- **This is not the Next.js you know.** Next 16, React 19, Tailwind 4, zod 4. Route `params` are `Promise`s, `middleware.ts` is `src/proxy.ts`, and `next lint` is gone. Read `node_modules/next/dist/docs/` before assuming familiar behaviour.
- `AGENTS.md` repeats the Next warning. The `dokiments-ui` skill (`.claude/skills/dokiments-ui/SKILL.md`) holds the detailed UI and design rules. Follow it for any frontend work.
- Make surgical changes. Don't refactor unrelated code or fix unrelated issues.

## Commands

| Task | Command |
| --- | --- |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` |
| Node tests | `npx vitest run --project node` |
| One folder | `npx vitest run --project node src/lib/email` |
| Storybook tests | `npx vitest run --project storybook <pattern>` |
| Rules tests | `npm run test:rules` (needs Java and the Firestore emulator) |
| Format changed files only | `npx prettier --write <files>` |

Prettier: 80 columns, double quotes, semicolons, trailing commas, **one attribute per line**. Never run it over the whole repo.

CI (`.github/workflows/pr-checks.yml`) runs lint, `tsc`, node tests, rules tests, build, then sharded Storybook tests. Before declaring work done, run lint, `tsc` and the relevant tests.

## Project layout

| Path | Contents |
| --- | --- |
| `src/app/` | Routes and `api/` route handlers. Pages stay thin and compose components. |
| `src/components/{commons,website,dashboard,admin}/` | UI. Pick exactly one bucket (see the skill). |
| `src/hooks/queries/` | TanStack Query hooks, one file per resource (`use-documents.ts`). |
| `src/stores/` | Zustand stores. Use sparingly. Prefer props or local state. |
| `src/lib/api/` | Route helpers: `withSession`, `parseBody`, `ApiError`, zod schemas. |
| `src/lib/firebase/server-*.ts` | Server-only Firestore and Auth access over REST. |
| `src/lib/<feature>/` | Feature logic (`sharing`, `notifications`, `pdf`, `email`, ...). |
| `src/types/` | Shared types, one file per domain. |
| `docs/` | One markdown file per feature or system. Keep it in sync with code. |

Import with the `@/` alias. Group imports as external, then `@/`, then relative, with a blank line between groups.

## Components

- Arrow functions with an exported `interface <Name>Props`. The component name is the **first class** on the root element (`<div className="shared-copy-status ...">`).
- **One component per file.** Extract any distinct sub-part into its own file in the same folder. Folder and file names are kebab-case.
- Every component has a colocated story at `stories/<name>.stories.tsx` with an explicit title: `Commons/Button`, `Dashboard/Sidebar` (never expose `stories` in the sidebar).
- Icons: Phosphor only (`@phosphor-icons/react`, `...Icon` names). Decorative icons get `aria-hidden`.
- Forms: React Hook Form with the inputs from `components/commons/`, validated with zod.
- Server state in TanStack Query hooks under `src/hooks/queries/`. Query keys come from `src/lib/query/keys.ts`.
- Reuse shared pieces before building bespoke ones: `Toaster` via `useToastStore`, `SidePanel`, `StepIndicator`, `DashboardList`, `ConfirmDialog`.

## Server code and API routes

- Server-only modules start with `import "server-only";`. Secrets never get a `NEXT_PUBLIC_` prefix.
- Config modules read env into an object plus a `has...Config()` guard (see `src/lib/firebase/server-config.ts`). Routes check the guard and answer a clean error, not an opaque provider failure.
- Wrap handlers in `withSession`. Parse every body with `parseBody(request, schema)`. Request bodies are untrusted even for signed-in users.
- Throw `ApiError(status, publicMessage)` for expected failures. Messages are user-safe and never contain provider or internal error text. Unexpected errors flow through `handleApiError`.
- Feature-flagged routes call their guard first (for example `assertDocumentSharingEnabled()`) and answer `404` while off.
- Side effects that must not slow or fail the response (email) run in `after()` and never throw into the request.
- Don't log secrets or full email addresses. Mask them.
- Firestore changes need matching `firestore.rules` updates and rules tests under `tests/firestore-rules/`.

## Documentation comments (JSDoc)

Write JSDoc for every exported function, hook, component, type, constant and route handler, and for any non-obvious private helper. Document **intent and contract**, not a restatement of the code.

Rules:

1. **Open with a one-line summary** of what it does or is for, then a blank line and the detail.
2. **Say why**, including the non-obvious reason, the invariant, or the trap it avoids (for example why the allow-list is ignored in production).
3. **Document the contract:**
   - Inputs and constraints (`@param name - description`, in prose when the type already says the rest).
   - Outputs, including every failure shape.
   - Whether it throws, never throws, or returns a result type.
   - Side effects, ordering and idempotency.
4. **Props, config and type fields** get a `/** ... */` line each. State the unit, the allowed values, the default, and the env var or source it comes from.
5. **Unions get one bullet per member**, saying when it applies.
6. **Add `@example`** for anything with a non-obvious call shape. Examples are realistic and short, and several `@example` tags are fine.
7. **Route handlers** document the method and path, the behaviour, and one `@returns` per status code with its body shape (see `src/app/api/documents/[id]/share/route.ts`).
8. **Use `{@link Symbol}`** to point at related symbols. Link docs by path (`docs/email.md`) when a longer write-up exists.
9. **Don't** repeat the type in prose, narrate line by line, leave `TODO`s without a ticket key, or comment the obvious. Inline `//` comments only explain non-obvious _why_.
10. Update the JSDoc in the same change as the behaviour it describes. A stale comment is a bug.

Reference examples: `src/lib/api/errors.ts`, `src/lib/api/validate.ts`, `src/lib/api/with-session.ts`, `src/lib/email/send-email.ts`, `src/lib/email/config.ts`.

```ts
/**
 * Sends one transactional email through Resend. This is the only module that
 * talks to the provider, so features never import `resend` directly.
 *
 * It never throws. Callers decide what a failed send means, and a failed email
 * must not fail the request that triggered it.
 *
 * @example
 * after(async () => {
 *   const result = await sendEmail({ to, subject, react, idempotencyKey });
 *   if (!result.ok) console.error("[share] email failed", result.reason);
 * });
 */
export const sendEmail = async ({ to, subject, react }: SendEmailInput) => { ... };

export type SendEmailInput = {
  /** A single recipient address. Surrounding whitespace is trimmed. */
  to: string;
  /**
   * Makes retries safe: Resend delivers a given key once. Build it from what
   * makes the email logically unique, never from a timestamp taken at send time.
   */
  idempotencyKey?: string;
};
```

## Testing

- **Node tests** (`src/**/*.test.ts`, next to the code) cover server logic, schemas and helpers. They must be `.ts`, not `.tsx`. Build elements with `createElement`. The `server-only` and `@/` aliases are configured in `vitest.config.ts`.
- **Storybook tests** cover components. Stories are the component tests, so give them realistic data and `play` functions for interactions.
- Mock at the boundary you own: mock our `sendEmail` wrapper in feature tests, and `resend` only in the wrapper's own tests. Stub env vars with `vi.stubEnv` and clean up with `vi.unstubAllEnvs()`.
- New behaviour ships with tests, including the failure paths (blocked, disabled, forbidden, conflict).
- Firestore rules tests need Java. If they can't run locally, say so rather than claiming they passed.

## CI gotchas

- `PageProps<"/route">` and other Next-generated globals exist only after Next generates `.next/types`. CI runs `tsc` on a clean checkout before `next build`, so **declare your own props interface** (`interface Props { params: Promise<{ id: string }> }`).
- To reproduce CI locally, type-check a **temp copy** that has no `.next`. **Never move, rename or copy `.next` inside the repo** (for example `.next.bak`): it is only ignored under its exact name, so Tailwind scans the copy as source and the dev server then fails with `Parsing CSS source code failed` (daisyUI `.cally` rule, control-character classes). Also avoid running `tsc` or tests against a repo with `next dev` running if it means touching `.next`.

  ```bash
  T=$(mktemp -d) && rsync -a --exclude .next --exclude node_modules --exclude .git --exclude tsconfig.tsbuildinfo ./ "$T/" \
    && ln -s "$PWD/node_modules" "$T/node_modules" && (cd "$T" && npx tsc --noEmit); rm -rf "$T"
  ```

  If the dev server already shows that CSS error, stop it, run `rm -rf .next`, and restart.
- Storybook doesn't load `next/font`, so fonts fall back there. Check PDF and font changes in a real export.

## Environment and configuration

- Document every new variable in `.env.example` with a comment saying what it does, whether it is server-only, and what happens when unset.
- Feature flags are `NEXT_PUBLIC_*` and inlined at build time, so changing one needs a rebuild and redeploy.
- Email, sharing and notifications each have a `docs/` write-up (`docs/email.md`, `docs/document-sharing.md`, `docs/notifications.md`). Update it when the behaviour changes.

## Git, commits and PRs

- Branches and commit subjects carry the Jira key, for example `DOK-176-...` and `Add sender signature styling (DOK-176)`.
- Commit subjects are imperative, at most 72 characters, with no trailing period. The body is 3 to 6 lines on _what and why_, wrapped at 72.
- Keep each commit self-contained and in a sensible order, so every commit builds and its tests pass.
- Never commit secrets, `.env.local` or API keys. Never push or commit unless asked.
- PR write-ups follow the `pr` skill (`.claude/skills/pr/SKILL.md`): title, description, commit subject and body. Stacked PRs describe only their own story.

## Security and privacy

- Treat all request input as untrusted. Validate with zod.
- Return user-safe messages only. Don't echo provider errors.
- Never expose server secrets to the client. Use no `NEXT_PUBLIC_` for credentials.
- Don't log personal data. Mask email addresses.
- Outside Production, email is restricted to an allow-list so tests can't reach real users. Keep that guard intact.
