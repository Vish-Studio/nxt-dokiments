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
