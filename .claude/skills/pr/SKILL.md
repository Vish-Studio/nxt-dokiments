---
name: pr
description: Generate a pull request title, description, commit message, and a commit breakdown (ordered git add/git commit commands) for the current changes. The commit message and breakdown cover the pending changes; the PR title and description cover the whole branch, including commits already made. Use when the user asks for a PR write-up, PR description, commit message, commit breakdown, or runs `/pr`.
user-invocable: true
---

# PR Write-up

Generate a commit message for the commit about to be made, a commit breakdown
that splits the pending changes into ordered commits, plus a pull request title
and description covering the entire branch.

These are two different scopes and must not be conflated:

| Output | Scope |
| --- | --- |
| Commit subject + body | Only the pending, uncommitted changes, as one commit |
| Commit breakdown | Only the pending, uncommitted changes, split into several commits |
| PR title + description | The whole branch: every commit since the base branch, **plus** the pending changes |

The skill only writes text. It never runs `git add`, `git commit` or `git push`
itself; the commit breakdown is a list of commands for the user to run.

## Steps

### 1. Establish the base branch

Run `git symbolic-ref --short refs/remotes/origin/HEAD` and strip the `origin/`
prefix. If that fails, use `dev`. Call the result `<base>`.

Prefer `origin/<base>` in the commands below. If `origin/<base>` doesn't resolve,
fall back to the local `<base>`.

### 2. Read the pending changes — scope of the commit message

- `git status --short` — staged, unstaged, and untracked files.
- `git diff HEAD` — staged and unstaged changes to tracked files.
- Read any relevant untracked files (new source files, hooks, config) to
  understand their contents.

`git diff HEAD` is deliberate rather than a bare `git diff`, so already-staged
changes are included.

### 3. Read the whole branch — scope of the PR

- `git log --oneline <base>..HEAD` — the commits already on this branch.
- `git merge-base HEAD <base>` — call the result `<merge-base>`.
- `git diff <merge-base>` — the cumulative diff from the base branch to the
  current working tree. This includes both the earlier commits and the pending
  changes, which is exactly the PR's scope.

If `git log <base>..HEAD` is empty, the branch has no commits of its own yet and
the two scopes are identical. Say nothing about it; just produce the output.

### 4. Collect Jira keys, if there are any

Jira keys are **optional**. Plenty of branches have none, and that is a normal
path that produces no Jira output at all — not a problem to report or work
around.

A key matches the pattern `[A-Z]+-[0-9]+` (e.g. `DOK-1234`). Gather candidates
from two sources, in this order:

1. The branch name, from `git branch --show-current`.
2. The commit subjects in the `git log --oneline <base>..HEAD` output from step 3.

Deduplicate, keeping first-seen order. Then determine the **primary key**:

- If the branch name contained a key, that is the primary key.
- Otherwise, if exactly one distinct key was found across all sources, that is
  the primary key.
- Otherwise there is no primary key.

Do not scan diff contents or file bodies for keys — code and fixtures contain
strings that look like keys but aren't.

## Output contract

Reply with **exactly five fenced code blocks**, each preceded by its bold label
and nothing else — no preamble, no commentary between the blocks, no summary
after them. Each block holds one field, so each can be copied straight into the
field it belongs to.

Fence every block with **four** backticks. Four are required because the content
contains triple-backtick fences and inline code; a three-backtick fence would
terminate early and break the block. Use the `markdown` info string, except for
the commit breakdown, which uses `bash`.

The whole reply looks exactly like this:

    **PR title**

    ````markdown
    Add x feature (DOK-1234)
    ````

    **PR description**

    ````markdown
    ## Summary

    <1–3 sentence overview of what this PR does and why>

    ## Implementation Summary

    <concise explanation of how the changed code implements the behavior>

    ### `<file or module>`

    <per-area breakdown>

    ### `<next file or module>`

    <per-area breakdown>

    ## Jira

    DOK-1234
    ````

    **Commit subject**

    ````markdown
    Add x feature (DOK-1234)
    ````

    **Commit body**

    ````markdown
    <3–6 lines explaining what changed and why>
    ````

    **Commit breakdown**

    ````bash
    git add <files for commit 1>
    git commit -m "Add x builder (DOK-1234)" \
      -m "<2–4 lines on what changed and why>"

    git add <files for commit 2>
    git commit -m "Wire x into y (DOK-1234)" \
      -m "<2–4 lines on what changed and why>"
    ````

When there are no Jira keys, the shape is identical except the `## Jira` section
is absent and no key is appended to the title, the subjects or the breakdown.

## Field rules

**PR title** — one line, under 70 characters, imperative mood, no trailing
period. Describes the branch as a whole, not just the pending commit. If there
is a primary key, append it in parentheses: `Add x feature (DOK-1234)`. Append
at most one key, never a list.

**PR description** — starts at `## Summary`; the title is not repeated inside
it. Write each paragraph as a single unwrapped line: do not hard-wrap at 72 or
80 columns, because GitHub renders those line breaks literally and the text
looks trimmed. (Only commit bodies are wrapped.) Covers the cumulative branch diff from step 3. Include a concise
`## Implementation Summary` section after the overview that explains the
concrete implementation: the main control flow, data flow, state changes, API
contracts, or test strategy that make the behavior work. Derive it only from
the code changes and keep it distinct from the high-level rationale in
`## Summary`. Then include one `###` section per changed area, covering every
changed area. Say what changed and the non-obvious reasoning behind it. For
deleted files, say what they replaced and why they're gone. For new files,
explain their role and any design decisions worth noting.

**`## Jira` section** — include it only if at least one key was found. List every
distinct key, one per line, in the order collected. Omit the entire section when
there are none: no heading, no placeholder, no "N/A", no sentence explaining the
absence.

**Commit subject** — describes only the pending changes from step 2. Imperative
mood, ≤72 chars, no trailing period. If there is a primary key, append it in
parentheses. It will often differ from the PR title, since the PR covers more
ground — do not copy one into the other unless the branch has only this one
commit.

**Commit body** — 3–6 lines on the pending changes only, explaining *what*
changed and *why*, not a re-listing of files. No bullet points. No
"Co-Authored-By" trailer. No blank first line; the block starts on the body's
first word. Wrap at 72 characters.

**Commit breakdown** — the pending changes (step 2) split into ordered commits,
as a runnable `git add` + `git commit` sequence, one pair per commit, separated
by a blank line. The skill never runs these itself.

- Every pending file, including untracked ones, appears in exactly one commit.
  List files explicitly in `git add`; never `git add .` or `-A`.
- Each commit is self-contained and in dependency order, so every commit builds
  and its tests pass: a module comes before the code that uses it, and its tests
  travel with it. Docs come last.
- Split by logical unit (for example builder + tests, wiring, UI, docs), not by
  file type. If the pending changes are small or inseparable, a single commit is
  fine.
- Each commit takes a subject (imperative, ≤72 chars, no trailing period, primary
  key appended in parentheses if there is one) as the first `-m`, and a 2–4 line
  body on *what* and *why* as a second `-m`, wrapped at 72 characters.
- Never add a `Co-authored-by` or `Co-Authored-By` trailer.
- Use `\` continuations between the `-m` flags so each command stays readable.
  Messages must not contain unescaped double quotes.

## Constraints

- Never invent a Jira key, never ask the user for one, and never mention Jira,
  tickets, or issue tracking anywhere in the output when no key was found.
- Describe only changes that are actually present in the diff. Do not infer
  formatting or refactoring work that isn't there.
- The PR description describes the branch's **end state**, not its history. The
  cumulative diff already collapses intermediate churn — a file added in an
  earlier commit and deleted in the pending changes simply isn't there. Never
  narrate the branch commit by commit, and never mention a change that the
  cumulative diff doesn't show, even if `git log` implies it happened.
- Use `git log` for context and ordering only, never as the source of truth for
  what changed. The diffs are the source of truth.
- Do not ask for confirmation before producing the output.
- Never run `git add`, `git commit` or `git push` as part of this skill, even
  though the commit breakdown contains those commands. Only the user runs them.
