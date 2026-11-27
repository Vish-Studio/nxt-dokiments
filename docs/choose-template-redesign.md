# Choose a template — redesign (DOK-70)

Status: built (Direction B, split picker) in `src/components/dashboard/template-picker/`,
wired into `DocumentsView`. Stories under `Dashboard/Template Picker`.
Canvas: Superdesign project "Dokiments – Choose a template".

## Flow from My Documents

1. My Documents → **New document** (yellow toolbar button on desktop, floating "+" on phones).
   Also entered from the Dashboard (`?new=1`), a company page (`?new=1&client=` / `&company=`)
   and the share target (`&shared=`).
2. **Choose a template** (this page) → pick one of the user's saved templates.
3. Editor, with sender, client and shared content prefilled → Save.

The page is in place: `DocumentsView` switches `mode` (`list` → `picker` → `editor`) with no
history entry.

## Problems with the current picker

- Cards are bare thumbnails with no name, type or style, so templates can't be told apart.
- Starting takes two clicks: card → preview dialog → Use.
- The title appears twice (banner + inner `h3`).
- **Back exits My Documents.** No history entry is pushed for picker or editor, so browser back
  or the phone back gesture skips the list. Biggest flow bug.
- No search, type filter or recent ordering (My Templates already has them).
- No route to the marketplace once at least one template is saved.
- The client chosen on a company page isn't shown while picking.

## Direction B — layout

### Desktop (≥ lg)
- Banner: back arrow + "New document" (inner `h3` removed).
- Left column (~380px, scrolls): "For: {company}" chip with clear (x) when prefilled; search
  "Search your templates"; type chips (All, Invoice, Quotation, Contract, NDA, …); list grouped
  by type with sticky headers ("INVOICES · 2"). Row: 40px A4 thumbnail, name, "Style · used 2 days
  ago". Selected row: golden left accent, `base-200` background. Ends with a dashed
  "Need another template? Browse marketplace" row. Keyboard: ↑/↓ moves, Enter uses.
- Right: live A4 preview of the selected template in a bento box; header with type badge, style
  and name; footer with helper text "Your client and company details are prefilled in the next
  step", outline "Preview full size" and primary "Use this template".

### Phone (< lg)
- **List only, no preview pane.** The sticky purple mobile header, the context chip, search and
  chips, then the same grouped list (64px rows, chevron). Tapping a row starts the document
  directly (one tap). Preview stays available in the editor.

## States
- Loading: list skeleton rows + "Loading your templates…"; preview skeleton on desktop.
- No templates: keep the current empty state ("No templates yet" → Browse marketplace).
- No search match: "No templates match" + Clear filters.
- One template: still shown (no auto-skip), pre-selected on desktop.

## Fixed in the build
- Back: `DocumentsView` pushes one history entry when the picker or editor opens, so the
  browser back button and the phone back gesture return to the list.
- Preview footer helper text wraps instead of truncating.
- The "For: {company}" chip has a clear (×) on every screen size.
- "Used X ago" comes from the user's newest document per template (`getTemplateLastUsed`).

Screenshots: `docs/assets/choose-template/`.
