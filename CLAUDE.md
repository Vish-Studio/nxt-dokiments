@AGENTS.md

@.github/copilot-instructions.md

## Skills and subagents

- `.claude/skills/dokiments-ui/` (symlink to `.codex/skills/dokiments-ui/`) — UI and design rules. Update it in the same change as any UI convention it describes.
- `.claude/skills/pr/` — PR and commit write-ups (`/pr`).
- `.claude/agents/` — specialist subagents. All of them preserve existing behaviour and never commit, push or deploy:
  - `ui-designer` — builds or reviews UI against the `dokiments-ui` skill.
  - `storybook-curator` — makes sure every new or changed component has complete, passing stories (including phone variants). Edits only story files.
  - `qa-tester` — runs the CI checks and drives the app in the browser, then reports defects. It edits only test and story files.
  - `performance-optimizer` — measures, then makes behaviour-preserving speed and bundle improvements.
  - `api-security-reviewer` — reviews `/api` routes, `src/lib/firebase`, `firestore.rules` and rules tests. Read-only.
  - `deployment` — release gate: runs the full CI gate and release checks (env, Firestore rules, version, promotion) and lists the deploy steps. Read-only; the user runs every push, merge, tag and deploy.

### Running the agents together

Subagents cannot call each other, so the main session runs the pipeline. When a change is done, run it in this order:

1. **Build:** `ui-designer` for UI work, `performance-optimizer` for speed work (or the main session itself). Never run two code-writing agents on the same files at once.
2. **Stories:** `storybook-curator` covers the changed components and runs their stories.
3. **Verify:** pass the reports to `qa-tester`. Send `api-security-reviewer` in parallel when server, auth or rules files changed (both are safe together because neither edits app code).
4. **Release gate:** `deployment` runs last and reports whether the change is ready to ship, with the deploy steps.
5. **Loop:** every report ends with a `### Handoff` block. Send each `next:` line to the named agent along with the report it came from. Stop when no `next:` lines remain, or ask the user if a `blocked on user:` line appears.
6. **Report:** summarise the combined result to the user, including anything not verified.

For a small change, the main session may run the same checks itself instead of spawning every agent, but it still covers stories, tests and the release gate.

### Keep the skills and agents current

Every change that adds or alters a convention (a component pattern, a design rule, a test helper, a workflow or deploy step) updates the matching file in the same change: `.claude/skills/dokiments-ui/SKILL.md` for UI, the relevant `.claude/agents/*.md` for how an agent should work, and this file for the workflow. A stale skill is a bug.

### UI work always ends with a screenshot

Whenever a change affects what the user sees, end the reply with a screenshot of the changed UI from the running app or Storybook (zoomed to the change; desktop and mobile if they differ). Use the browser tools directly, or show the screenshots `ui-designer` saved. If no screenshot was possible, say why.
