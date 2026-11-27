@AGENTS.md

@.github/copilot-instructions.md

## Skills and subagents

- `.claude/skills/dokiments-ui/` (symlink to `.codex/skills/dokiments-ui/`) — UI and design rules. Update it in the same change as any UI convention it describes.
- `.claude/skills/pr/` — PR and commit write-ups (`/pr`).
- `.claude/agents/` — thirteen specialist subagents, arranged like a SaaS product team. All of them preserve existing behaviour and never commit, push or deploy:
  - **Discover and design:**
    - `product-manager` — problem, scope, user stories with acceptance criteria, priority, "not now" list. Edits only `docs/specs/`.
    - `ux-designer` — user flow, information architecture, states, phone behaviour and copy **before any UI**, with screenshots; reviews finished pages against `docs/dashboard-ux-flow.md`. Edits only `docs/`.
    - `ui-designer` — the visual spec on the design system (components, tokens, exact classes, desktop and phone) before a build, and the design review after; small presentational fixes only.
  - **Plan:**
    - `tech-lead` — impact map, ordered tasks and risks before a multi-file change; reviews the diff before a PR, in Divesh Heeramun's style (`docs/engineering-style.md`). Read-only.
  - **Build:**
    - `frontend-engineer` — components, pages, hooks, client state and their node tests, from the UX flow, visual spec and plan.
    - `backend-engineer` — `/api` routes, `src/lib/firebase` server modules, `firestore.rules` and rules tests, email.
    - `performance-optimizer` — measures, then makes behaviour-preserving speed and bundle improvements.
  - **Verify:**
    - `storybook-curator` — every new or changed component has complete, passing stories (including phone variants). Edits only story files.
    - `qa-tester` — runs the CI checks and drives the app in the browser, then reports defects. Edits only test and story files.
    - `accessibility-auditor` — WCAG 2.2 AA review in Storybook or the app. Read-only.
    - `api-security-reviewer` — reviews `/api` routes, `src/lib/firebase`, `firestore.rules` and rules tests. Read-only.
  - **Ship:**
    - `technical-writer` — keeps `docs/`, the skill, the agents and this file accurate. Edits markdown only.
    - `deployment` — release gate: runs the full CI gate and release checks (env, Firestore rules, version, promotion) and lists the deploy steps. Read-only; the user runs every push, merge, tag and deploy.

### Running the agents together

Subagents cannot call each other, so the main session runs the pipeline, in a fixed order. **UX comes before UI, and UI before code**: for any change that adds, moves or removes a user action, the flow is designed, shown and written down first, then given a visual spec, then built. Before changing existing code, have the relevant agents (at least `ui-designer` and `tech-lead`) review the current implementation. Each phase starts only when the previous phase's gate is met (the same table is in every agent file).

| # | Phase | Agent | Gate before the next phase |
| --- | --- | --- | --- |
| 1 | Define | `product-manager` | A one-page spec with acceptance criteria exists in `docs/specs/` |
| 2 | Design the flow | `ux-designer` | Flow, states, phone behaviour and copy are in `docs/`, and **screenshots of the current state and the proposed flow have been shown to the user**. For a large redesign the user has picked an option |
| 3 | Visual design | `ui-designer` | A visual spec (or a design the user approved); for small changes, a design review of the current code with exact classes |
| 4 | Plan | `tech-lead` | An ordered plan: logic and shared components first, pages after, commits in the order of `docs/engineering-style.md` |
| 5 | Build | `frontend-engineer` and/or `backend-engineer` (`performance-optimizer` for speed work; or the main session) | Lint, type-check and node tests pass, and **desktop and phone screenshots of every changed state have been shown to the user** |
| 6 | Stories | `storybook-curator` | Passing stories for every changed component, sharing on and off, with phone variants |
| 7 | Verify (parallel) | `qa-tester`, `ui-designer` (design review), `accessibility-auditor`, `api-security-reviewer` when server, auth or rules changed, and `tech-lead` reviewing the diff | No open blocker; defects go back to phase 5 |
| 8 | Document | `technical-writer` | Docs, skill, agent files and this file match the code |
| 9 | Release gate | `deployment` | Ready to ship, with the deploy steps; the user runs every push, merge and deploy |

- Phase 7 agents never edit app code, so they are safe in parallel. Never run two code-writing agents on the same files at once; `frontend-engineer` and `backend-engineer` may run in parallel only on separate files.
- **Screenshots:** `ux-designer`, `ui-designer`, `frontend-engineer` and `storybook-curator` must save desktop (1280px) and phone (393px) screenshots of their work and list the paths in their handoff; `qa-tester` and `accessibility-auditor` attach them for visible defects. Agents cannot show images, so **the main session sends them to the user with `SendUserFile`** at the end of phase 2, phase 3 and phase 5 (and with the final report).
- **Style:** `tech-lead` plans and reviews in Divesh Heeramun's style, written in `docs/engineering-style.md`. Features are split into small self-contained commits: types and helpers, then server and rules, then UI, then docs.
- **Loop:** every report ends with a `### Handoff` block. Send each `next:` line to the named agent along with the report it came from. Stop when no `next:` lines remain, or ask the user if a `blocked on user:` line appears.
- **Report:** summarise the combined result to the user, including anything not verified.

For a small change, the main session may run the same checks itself instead of spawning every agent, but it still covers stories, tests, accessibility basics, screenshots and the release gate.

### Keep the skills and agents current

Every change that adds or alters a convention (a component pattern, a design rule, a test helper, a workflow or deploy step) updates the matching file in the same change: `.claude/skills/dokiments-ui/SKILL.md` for UI, `docs/dashboard-ux-flow.md` for page anatomy, states and journeys, the relevant `.claude/agents/*.md` for how an agent should work, and this file for the workflow. A stale skill is a bug.

### UI work always ends with a screenshot

Whenever a change affects what the user sees, end the reply with a screenshot of the changed UI from the running app or Storybook (zoomed to the change; desktop and mobile if they differ). Use the browser tools directly, or show the screenshots `ui-designer` saved. If no screenshot was possible, say why.
