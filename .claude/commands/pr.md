# PR Write-up

Generate a pull request title, description, and commit message for the current unstaged changes.

## Steps

1. Run `git diff && git status --short` to read all unstaged and untracked changes.
2. For any untracked files that are relevant (new source files, hooks, config), read them with the Read tool to understand their contents.
3. Run `git branch --show-current` to get the current branch name.
4. Extract the Jira key from the branch name if present — it matches the pattern `[A-Z]+-[0-9]+` (e.g. `DOK-1234` in `feat/DOK-1234-add-x-feature`). If no key is found in the branch name, there is no Jira key — do not invent one.
5. Produce the following, in this order:

### PR title
One line, under 70 characters, imperative mood, no trailing period. If a Jira key was found, append it in parentheses: `Add x feature (DOK-1234)`.

### PR description
Use this format exactly:

```
## Summary

<1–3 sentence overview of what this PR does and why>

### `<file or module>`

<per-area breakdown — what changed and the non-obvious reasoning behind it. Cover every changed area. For deleted files, say what they replaced and why they're gone. For new files, explain their role and any design decisions worth noting.>
```

If a Jira key was found, append this section at the end of the description:

```
## Jira

<KEY>
```

Where `<KEY>` is the Jira key (e.g. `DOK-1234`).

### Commit message

A short subject line (imperative mood, ≤72 chars) — if a Jira key was found, append it in parentheses: `Add x feature (DOK-1234)`. Then a blank line, then a body of 3–6 lines explaining *what* changed and *why* — not a re-listing of files. No bullet points. No "Co-Authored-By" trailer.

---

Do not ask for confirmation. Output all three artefacts in one response, in the order: title → description → commit message.
