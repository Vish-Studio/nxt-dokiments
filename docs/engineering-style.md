# Engineering style

How code and changes are written in this repo, in the style of **Divesh
Heeramun**, who wrote most of it. The `tech-lead` agent plans and reviews
against this page.

This is read from the work, not from a rulebook he wrote: about 290 commits and
the modules he authored (`src/lib/api/*`, `src/lib/email/*`,
`src/lib/sharing/*`, `src/components/dashboard/share-timeline`). When he
corrects something here, the correction wins; update this page in the same
change. Where the repo's conventions (`.github/copilot-instructions.md`) say
more, they still apply.

## 1. The shape of a change

A feature is a short series of small commits in a fixed order, each one
self-contained (it builds and its tests pass):

1. **Types and pure helpers**: the logic, with its unit tests.
   (`Add share activity types and helpers (DOK-156)`)
2. **Server and rules**: routes, Firestore rules and their tests.
   (`Add revoke, view tracking and re-share handling (DOK-156)`)
3. **UI**: components and stories, built on the helpers.
   (`Add share management panel and timeline UI (DOK-156)`)
4. **Docs**: one commit that documents the feature in `docs/`.
   (`Document share management (DOK-156)`)

Commit messages:

- Subject: imperative, sentence case, 72 characters or fewer, no trailing period,
  Jira key in parentheses at the end: `Send the signed email from the sign route (DOK-186)`.
- Body (when it earns one): two or three short lines on what changed and why,
  wrapped at 72. Never a list of files.
- Four to six commits per feature. A commit that mixes logic, UI and docs is a
  sign it should be split.

## 2. Code

- **Small modules, one job.** Logic lives in a plain `.ts` module and the
  component only renders it: `share-activity.ts` works out events,
  `share-timeline.tsx` draws them.
- **Arrow-function exports**, named, no default exports for logic.
- **Derive, don't store.** Compute a status from the records that prove it (a
  signature means signed) instead of trusting a flag that can drift. Say so in
  the comment.
- **Narrow inputs.** Take `Pick<SharedDocument, "recipients">`, not the whole
  document. Take `readonly` arrays when you only read them.
- **Guard clauses and early returns** over nesting. `.at(-1)`, optional chaining
  and `find` over index arithmetic.
- **Typed errors with public messages** (`ApiError(status, publicMessage)`); never
  leak provider text. Expected failure is a thrown `ApiError`, unexpected goes
  through `handleApiError`.
- **Constants at module scope**: `Intl` formatters are created once, lookup
  tables are `Record<Union, string>`, numbers read as `60_000`.
- **Alphabetical order** for object keys, union members and type fields, unless
  the order itself means something (a timeline). It makes diffs small and lookups
  fast.
- No `any`, no `// @ts-ignore`, no leftover `TODO` without a ticket key.

## 3. Documentation comments

Every exported function, hook, component, type and constant has one, and it
explains **intent and contract**, not the code:

1. One-line summary, a blank line, then the detail.
2. **Why**: the invariant or the trap it avoids ("recipients cannot write
   `recipients`, so the signature and the view are the source of truth").
3. `@param` for what the type does not say, `@returns` including when the result
   is `undefined`, `@throws` for the failure shapes, `@example` with a realistic
   call.
4. Type fields get a `/** … */` line each with the unit ("Epoch milliseconds.");
   unions get one bullet per member.
5. Inline `//` comments only for a non-obvious reason, and they are updated with
   the code.

## 4. React

- `export interface <Name>Props`, every prop documented; the component name is
  the first class on the root element (`share-timeline grid gap-2`).
- Semantic HTML first: `ol` / `li` for sequences, `time` with `dateTime`, real
  buttons and links.
- Return `null` early when there is nothing to show.
- Keys are stable and composite when needed (`${kind}-${email}-${at}`).
- Props before stores; state only where it is needed. A distinct sub-part gets
  its own file and its own story.

## 5. Tests

- Colocated `*.test.ts` next to the module.
- A small factory with overrides (`recipient({ status: "revoked" })`) instead of
  copied fixtures.
- One `describe` per function; each `it` is a sentence about behaviour
  ("skips revoked recipients", "has no active recipient once everyone is
  revoked").
- The failure and edge paths are the point: revoked, empty, no recipients,
  disabled, forbidden, conflict.
- Components get stories with `play` functions; both the sharing-on and
  sharing-off CI runs must pass.

## 6. What the tech lead checks

When planning: is the logic separable and first, is each step a self-contained
commit in the order above, is there a docs commit.

When reviewing a diff: the points in sections 2 to 5, plus **one way to do each
job** (reuse the shared component instead of adding a second), behaviour not
changed unasked, and a doc comment that still tells the truth.
