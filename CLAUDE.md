@AGENTS.md

@.github/copilot-instructions.md

## Skills and subagents

- `.claude/skills/dokiments-ui/` (symlink to `.codex/skills/dokiments-ui/`) — UI and design rules. Update it in the same change as any UI convention it describes.
- `.claude/skills/pr/` — PR and commit write-ups (`/pr`).
- `.claude/agents/` — specialist subagents. All of them preserve existing behaviour and never commit or push:
  - `ui-designer` — builds or reviews UI against the `dokiments-ui` skill.
  - `qa-tester` — runs the CI checks and drives the app in the browser, then reports defects. It edits only test and story files.
  - `performance-optimizer` — measures, then makes behaviour-preserving speed and bundle improvements.
  - `api-security-reviewer` — reviews `/api` routes, `src/lib/firebase`, `firestore.rules` and rules tests. Read-only.

### Running the agents together

Subagents cannot call each other, so the main session runs the pipeline:

1. **Build:** `ui-designer` for UI work, `performance-optimizer` for speed work. Never run two code-writing agents on the same files at once.
2. **Verify:** pass the builder's report to `qa-tester`. Send `api-security-reviewer` in parallel when server, auth or rules files changed (both are safe to run together because neither edits app code).
3. **Loop:** every report ends with a `### Handoff` block. Send each `next:` line to the named agent along with the report it came from. Stop when no `next:` lines remain, or ask the user if a `blocked on user:` line appears.
4. **Report:** summarise the combined result to the user, including anything not verified.

### UI work always ends with a screenshot

Whenever a change affects what the user sees, end the reply with a screenshot of the changed UI from the running app or Storybook (zoomed to the change; desktop and mobile if they differ). Use the browser tools directly, or show the screenshots `ui-designer` saved. If no screenshot was possible, say why.
