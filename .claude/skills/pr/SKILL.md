---
name: pr
description: Generate a pull request title, description, and commit message for the current unstaged changes, extracting the Jira key from the branch name. Use when the user asks for a PR write-up, PR description, commit message, or runs `/pr`.
user-invocable: true
---

# PR Write-up

Generate a pull request title, description, and commit message for the current unstaged changes.

## Steps

1. Run `git diff && git status --short` to read all unstaged and untracked changes.
2. For any untracked files that are relevant (new source files, hooks, config), read them to understand their contents.
3. Run `git branch --show-current` to get the current branch name.
4. Extract the Jira key from the branch name if present — it matches the pattern `[A-Z]+-[0-9]+` (e.g. `DOK-1234` in `feat/DOK-1234-add-x-feature`). If no key is found in the branch name, there is no Jira key — do not invent one.
5. Reply using the output contract below.

## Output contract

Reply with **exactly two fenced code blocks and nothing else** — no preamble, no
headings of your own, no commentary between the blocks, no summary after them.
The entire reply is the two blocks.

Fence both blocks with **four** backticks and the `markdown` info string:

````markdown
…content…
````

Four backticks are required because the content contains triple-backtick fences
and inline code; a three-backtick fence would terminate early and break the
block.

### Block 1 — the pull request

First line is the PR title. Then one blank line. Then the description. Structure:

    <PR title>

    ## Summary

    <1–3 sentence overview of what this PR does and why>

    ### `<file or module>`

    <per-area breakdown>

    ### `<next file or module>`

    <per-area breakdown>

    ## Jira

    <KEY>

Rules:

- **Title** — one line, under 70 characters, imperative mood, no trailing
  period. If a Jira key was found, append it in parentheses:
  `Add x feature (DOK-1234)`.
- **Per-area sections** — one `###` per changed area, covering every changed
  area. Say what changed and the non-obvious reasoning behind it. For deleted
  files, say what they replaced and why they're gone. For new files, explain
  their role and any design decisions worth noting.
- **Jira section** — include it only if a Jira key was found. Omit the whole
  section otherwise.

### Block 2 — the commit message

    <subject line>

    <body>

Rules:

- **Subject** — imperative mood, ≤72 chars. If a Jira key was found, append it
  in parentheses: `Add x feature (DOK-1234)`.
- **Body** — one blank line after the subject, then 3–6 lines explaining *what*
  changed and *why*. Not a re-listing of files. No bullet points. No
  "Co-Authored-By" trailer. Wrap at 72 characters.

## Constraints

- Describe only changes that are actually present in the diff. Do not infer
  formatting or refactoring work that isn't there.
- Do not ask for confirmation before producing the output.
